variable "enabled" {
  type = bool
  default = true
}
variable "name" { type = string }
variable "visibility_timeout_seconds" {
  type = number
  default = 60
}
variable "max_receive_count" {
  type = number
  default = 5
}
variable "kms_key_id" {
  type = string
  default = null
}
variable "tags" {
  type = map(string)
  default = {}
}
