resource "aws_opensearch_domain" "this" {
  count       = var.enabled ? 1 : 0
  domain_name = var.domain_name

  cluster_config {
    instance_type          = var.instance_type
    instance_count         = var.instance_count
    zone_awareness_enabled = var.instance_count > 1
  }

  vpc_options {
    subnet_ids         = slice(var.subnet_ids, 0, min(length(var.subnet_ids), var.instance_count > 1 ? 2 : 1))
    security_group_ids = var.security_group_ids
  }

  encrypt_at_rest {
    enabled    = true
    kms_key_id = var.kms_key_id
  }
  node_to_node_encryption { enabled = true }
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  tags = var.tags
}
