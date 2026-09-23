variable "name" { type = string }
variable "log_retention_days" {
  type    = number
  default = 30
}
variable "alarm_topic_arn" {
  type    = string
  default = null
}
variable "owner" {
  type    = string
  default = "sre"
}
variable "dashboard_url" {
  type    = string
  default = "https://console.aws.amazon.com/cloudwatch/home#dashboards"
}
variable "escalation_route" {
  type    = string
  default = "on-call"
}
variable "runbook_base_url" {
  type    = string
  default = "docs/runbooks"
}
variable "error_rate_threshold" {
  type    = number
  default = 5
}
variable "slo_burn_threshold" {
  type    = number
  default = 2
}
variable "queue_age_threshold" {
  type    = number
  default = 120
}
variable "dlq_growth_threshold" {
  type    = number
  default = 1
}
variable "tags" {
  type    = map(string)
  default = {}
}
