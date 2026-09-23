variable "vpc_id" { type = string }
variable "region" { type = string }
variable "route_table_ids" { type = list(string) default = [] }
variable "subnet_ids" { type = list(string) default = [] }
variable "security_group_ids" { type = list(string) default = [] }
variable "enable_interface_endpoints" { type = bool default = true }
variable "tags" { type = map(string) default = {} }
