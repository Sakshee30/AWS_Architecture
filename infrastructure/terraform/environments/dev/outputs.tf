output "appconfig" { value={application_id=module.appconfig.application_id,environment_id=module.appconfig.environment_id,configuration_profile_id=module.appconfig.configuration_profile_id} }
output "secret_metadata" { value=module.secrets.secret_metadata }
output "kms_key_arn" { value=module.kms.key_arn }
output "cloudtrail_arn" { value=module.audit.cloudtrail_arn }