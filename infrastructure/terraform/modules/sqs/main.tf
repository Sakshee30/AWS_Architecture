resource "aws_sqs_queue" "dlq" {
  count             = var.enabled ? 1 : 0
  name              = "${var.name}-dlq"
  kms_master_key_id = var.kms_key_id
  tags              = var.tags
}

resource "aws_sqs_queue" "this" {
  count                      = var.enabled ? 1 : 0
  name                       = var.name
  visibility_timeout_seconds = var.visibility_timeout_seconds
  kms_master_key_id          = var.kms_key_id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[0].arn
    maxReceiveCount     = var.max_receive_count
  })
  tags = var.tags
}
