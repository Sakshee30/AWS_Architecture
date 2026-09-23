output "bootstrap_brokers_tls" { value = var.enabled ? aws_msk_cluster.this[0].bootstrap_brokers_tls : null }
