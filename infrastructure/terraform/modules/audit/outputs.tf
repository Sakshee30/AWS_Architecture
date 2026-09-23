output "cloudtrail_arn" { value = aws_cloudtrail.this.arn }
output "audit_bucket_arn" { value = aws_s3_bucket.logs.arn }
output "config_recorder_name" { value = aws_config_configuration_recorder.this.name }