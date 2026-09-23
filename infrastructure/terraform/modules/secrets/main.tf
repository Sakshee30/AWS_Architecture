resource "aws_secretsmanager_secret" "this" {
 for_each = var.secret_names
 name = each.value
 kms_key_id = var.kms_key_id
 recovery_window_in_days = var.recovery_window_in_days
 tags = var.tags
}