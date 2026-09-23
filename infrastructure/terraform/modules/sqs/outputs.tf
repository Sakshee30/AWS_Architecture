output "queue_url" { value = var.enabled ? aws_sqs_queue.this[0].url : null }
output "queue_arn" { value = var.enabled ? aws_sqs_queue.this[0].arn : null }
output "dlq_arn" { value = var.enabled ? aws_sqs_queue.dlq[0].arn : null }
