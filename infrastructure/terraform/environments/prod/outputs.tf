output "desired_state" { value = module.platform.desired_state }
output "vpc_id" { value = module.platform.vpc_id }
output "rds_endpoint" {
  value     = module.platform.rds_endpoint
  sensitive = true
}
output "redis_endpoint" {
  value     = module.platform.redis_endpoint
  sensitive = true
}
output "sqs_queue_url" { value = module.platform.sqs_queue_url }
output "opensearch_endpoint" {
  value     = module.platform.opensearch_endpoint
  sensitive = true
}
