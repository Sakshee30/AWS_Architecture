output "endpoint" {
  value = try(aws_opensearch_domain.this[0].endpoint, null)
}

output "domain_arn" {
  value = try(aws_opensearch_domain.this[0].arn, null)
}
