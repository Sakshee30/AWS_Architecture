variable "aws_region" { type=string default="ap-south-1" }
variable "application_name" { type=string }
variable "owner" { type=string }
variable "cost_center" { type=string }
variable "audit_bucket_name" { type=string }
variable "non_secret_parameters" { type=map(string) default={} }
variable "secret_names" { type=set(string) default=[] }
variable "secret_rotation" {
  type = map(object({
    lambda_arn = string
    days       = number
  }))
  default = {}
}
variable "initial_configuration" {
  type = object({
    version = number
    capabilities = map(object({
      enabled  = bool
      provider = string
      fallback = optional(string)
    }))
  })
  default = { version = 1, capabilities = {} }
}