resource "aws_elasticache_subnet_group" "this" {
  count      = var.enabled ? 1 : 0
  name       = "${var.name}-redis-subnets"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "this" {
  count                      = var.enabled ? 1 : 0
  replication_group_id       = var.name
  description                = "${var.name} redis"
  node_type                  = var.node_type
  port                       = 6379
  automatic_failover_enabled = true
  multi_az_enabled           = true
  num_cache_clusters         = 1 + var.replicas_per_node_group
  subnet_group_name          = aws_elasticache_subnet_group.this[0].name
  security_group_ids         = var.security_group_ids
  transit_encryption_enabled = true
  at_rest_encryption_enabled = true
  tags                       = var.tags
}
