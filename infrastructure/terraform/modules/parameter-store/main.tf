resource "aws_ssm_parameter" "this" {
 for_each = var.parameters
 name = each.key
 type = "String"
 value = each.value
 tags = var.tags
}