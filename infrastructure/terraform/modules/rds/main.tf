resource "aws_db_subnet_group" "this" {
  name       = "${var.identifier}-subnets"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "aws_db_instance" "this" {
  identifier                  = var.identifier
  engine                      = "postgres"
  engine_version              = var.engine_version
  instance_class              = var.instance_class
  db_name                     = var.db_name
  username                    = "platform_admin"
  manage_master_user_password = true
  storage_encrypted           = true
  kms_key_id                  = var.kms_key_id
  db_subnet_group_name        = aws_db_subnet_group.this.name
  vpc_security_group_ids      = var.security_group_ids
  multi_az                    = var.multi_az
  backup_retention_period     = var.backup_retention_days
  deletion_protection         = true
  skip_final_snapshot         = false
  publicly_accessible         = false
  auto_minor_version_upgrade  = true
  tags                        = var.tags
}
