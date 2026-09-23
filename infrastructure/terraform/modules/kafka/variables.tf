variable "enabled" { type = bool default = false }
variable "name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kafka_version" { type = string default = "3.7.x" }
variable "broker_instance_type" { type = string default = "kafka.m5.large" }
variable "broker_nodes" { type = number default = 3 }
variable "tags" { type = map(string) default = {} }
