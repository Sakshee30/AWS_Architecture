variable "name" { type = string }
variable "cidr" {
  type = string
  default = "10.0.0.0/16"
}
variable "azs" { type = list(string) }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_app_subnet_cidrs" { type = list(string) }
variable "isolated_data_subnet_cidrs" { type = list(string) }
variable "enable_nat_gateway" {
  type = bool
  default = true
}
variable "tags" {
  type = map(string)
  default = {}
}
