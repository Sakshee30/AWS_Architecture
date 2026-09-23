output "desired_state" { value = local.desired_state }
output "vpc_id" { value = module.vpc.vpc_id }
output "rds_endpoint" {
  value     = module.rds.endpoint
  sensitive = true
}
output "redis_endpoint" {
  value     = module.redis.endpoint
  sensitive = true
}
output "sqs_queue_url" { value = module.sqs.queue_url }
output "opensearch_endpoint" {
  value     = module.opensearch.endpoint
  sensitive = true
}
output "alb_dns_name" { value = module.alb.dns_name }
