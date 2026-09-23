variable "enabled" { type = bool default = true }
variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "certificate_arn" { type = string default = null }
variable "tags" { type = map(string) default = {} }
