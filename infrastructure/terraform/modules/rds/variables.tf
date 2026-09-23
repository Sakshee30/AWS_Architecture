variable "identifier" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_id" { type = string }
variable "db_name" { type = string default = "platform" }
variable "engine_version" { type = string default = "16.4" }
variable "instance_class" { type = string default = "db.t4g.medium" }
variable "multi_az" { type = bool default = false }
variable "backup_retention_days" { type = number default = 7 }
variable "tags" { type = map(string) default = {} }
