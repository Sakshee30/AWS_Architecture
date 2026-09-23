terraform {
 required_version = ">= 1.6.0"
}
provider "aws" { region = var.aws_region default_tags { tags = local.tags } }
locals { tags = { Application=var.application_name, Environment="dev", Service="platform", Owner=var.owner, CostCenter=var.cost_center } }
module "kms" { source="../../modules/kms" alias_name="${var.application_name}-dev" tags=local.tags }
module "appconfig" { source="../../modules/appconfig" application_name=var.application_name environment_name="dev" tags=local.tags }
module "parameters" { source="../../modules/parameter-store" parameters=var.non_secret_parameters tags=local.tags }
module "secrets" { source="../../modules/secrets" secret_names=var.secret_names kms_key_id=module.kms.key_arn tags=local.tags }
module "audit" { source="../../modules/audit" name="${var.application_name}-dev" log_bucket_name=var.audit_bucket_name kms_key_arn=module.kms.key_arn tags=local.tags }