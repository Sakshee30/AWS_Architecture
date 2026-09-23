variable "enabled" {
  type    = bool
  default = true
}
variable "name" { type = string }
variable "origin_domain_name" { type = string }
variable "web_acl_id" {
  type    = string
  default = null
}
variable "certificate_arn" {
  type    = string
  default = null
}
variable "aliases" {
  type    = list(string)
  default = []
}
variable "tags" {
  type    = map(string)
  default = {}
}
