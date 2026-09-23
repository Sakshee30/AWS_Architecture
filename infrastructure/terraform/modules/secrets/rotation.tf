variable "rotation" {
  description = "Optional rotation configuration keyed by secret name."
  type = map(object({
    lambda_arn    = string
    days          = number
  }))
  default = {}
}

resource "aws_secretsmanager_secret_rotation" "this" {
  for_each            = var.rotation
  secret_id           = aws_secretsmanager_secret.this[each.key].id
  rotation_lambda_arn = each.value.lambda_arn

  rotation_rules {
    automatically_after_days = each.value.days
  }
}