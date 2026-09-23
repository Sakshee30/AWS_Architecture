resource "aws_iam_role" "this" {
  name = var.name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = var.trusted_service }, Action = "sts:AssumeRole" }]
  })
  tags = var.tags
}
resource "aws_iam_role_policy" "this" {
  name   = "${var.name}-least-privilege"
  role   = aws_iam_role.this.id
  policy = var.policy_json
}
