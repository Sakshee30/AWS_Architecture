variable "name" { type = string }
variable "kms_key_id" {
  type = string
  default = null
}
variable "tags" {
  type = map(string)
  default = {}
}
