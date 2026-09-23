variable "enabled" { type = bool default = false }
variable "domain_name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_id" { type = string }
variable "instance_type" { type = string default = "t3.small.search" }
variable "instance_count" { type = number default = 2 }
variable "tags" { type = map(string) default = {} }
