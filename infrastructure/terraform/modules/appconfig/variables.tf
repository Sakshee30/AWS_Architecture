variable "application_name" { type = string }
variable "environment_name" { type = string }
variable "configuration_profile_name" {
  type    = string
  default = "platform-capabilities"
}
variable "deployment_strategy_id" {
  type    = string
  default = "AppConfig.Linear20PercentEvery6Minutes"
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
variable "tags" {
  type    = map(string)
  default = {}
}
