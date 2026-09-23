variable "alias_name" { type = string }
variable "description" {
  type    = string
  default = "Platform managed encryption key"
}
variable "deletion_window_in_days" {
  type    = number
  default = 30
}
variable "tags" {
  type    = map(string)
  default = {}
}
