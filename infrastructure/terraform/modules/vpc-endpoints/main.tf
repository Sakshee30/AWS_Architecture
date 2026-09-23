resource "aws_vpc_endpoint" "s3" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.route_table_ids
  tags              = var.tags
}

locals {
  interface_services = toset(["ecr.api","ecr.dkr","logs","secretsmanager","sts"])
}

resource "aws_vpc_endpoint" "interface" {
  for_each            = var.enable_interface_endpoints ? local.interface_services : toset([])
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.region}.${each.value}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.subnet_ids
  security_group_ids  = var.security_group_ids
  private_dns_enabled = true
  tags                = var.tags
}
