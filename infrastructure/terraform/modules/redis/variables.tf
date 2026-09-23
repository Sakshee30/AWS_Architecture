variable "enabled" {
  type    = bool
  default = false
}
variable "name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "node_type" {
  type    = string
  default = "cache.t4g.small"
}
variable "replicas_per_node_group" {
  type    = number
  default = 1
}
variable "tags" {
  type    = map(string)
  default = {}
}
