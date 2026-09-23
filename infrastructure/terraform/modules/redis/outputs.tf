output "endpoint" { value = var.enabled ? aws_elasticache_replication_group.this[0].primary_endpoint_address : null }
