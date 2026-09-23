data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "logs" { bucket = var.log_bucket_name tags = var.tags }
resource "aws_s3_bucket_public_access_block" "logs" {
 bucket = aws_s3_bucket.logs.id
 block_public_acls = true
 block_public_policy = true
 ignore_public_acls = true
 restrict_public_buckets = true
}
resource "aws_s3_bucket_versioning" "logs" {
 bucket = aws_s3_bucket.logs.id
 versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
 bucket = aws_s3_bucket.logs.id
 rule { apply_server_side_encryption_by_default {
  sse_algorithm = var.kms_key_arn == null ? "AES256" : "aws:kms"
  kms_master_key_id = var.kms_key_arn
 }}
}
resource "aws_s3_bucket_policy" "cloudtrail" {
 bucket = aws_s3_bucket.logs.id
 policy = jsonencode({ Version="2012-10-17", Statement=[
  { Sid="AclCheck", Effect="Allow", Principal={Service="cloudtrail.amazonaws.com"}, Action="s3:GetBucketAcl", Resource=aws_s3_bucket.logs.arn },
  { Sid="Write", Effect="Allow", Principal={Service="cloudtrail.amazonaws.com"}, Action="s3:PutObject", Resource="${aws_s3_bucket.logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*", Condition={StringEquals={"s3:x-amz-acl"="bucket-owner-full-control"}} }
 ]})
}
resource "aws_cloudtrail" "this" {
 name = var.name
 s3_bucket_name = aws_s3_bucket.logs.id
 include_global_service_events = true
 is_multi_region_trail = true
 enable_log_file_validation = true
 kms_key_id = var.kms_key_arn
 depends_on = [aws_s3_bucket_policy.cloudtrail]
 tags = var.tags
}
resource "aws_iam_role" "config" {
 name = "${var.name}-config"
 assume_role_policy = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Principal={Service="config.amazonaws.com"},Action="sts:AssumeRole"}]})
}
resource "aws_iam_role_policy_attachment" "config" { role=aws_iam_role.config.name policy_arn="arn:aws:iam::aws:policy/service-role/AWS_ConfigRole" }
resource "aws_config_configuration_recorder" "this" {
 name = "${var.name}-recorder"
 role_arn = aws_iam_role.config.arn
 recording_group { all_supported=true include_global_resource_types=true }
}
resource "aws_config_delivery_channel" "this" { name="${var.name}-delivery" s3_bucket_name=aws_s3_bucket.logs.id depends_on=[aws_config_configuration_recorder.this] }
resource "aws_config_configuration_recorder_status" "this" { name=aws_config_configuration_recorder.this.name is_enabled=true depends_on=[aws_config_delivery_channel.this] }