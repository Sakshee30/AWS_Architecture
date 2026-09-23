variable "name" { type = string }
variable "trusted_service" { type = string }
variable "policy_json" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}
