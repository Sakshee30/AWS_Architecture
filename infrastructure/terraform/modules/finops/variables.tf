variable "name" { type = string }
variable "monthly_budget_usd" { type = number }
variable "alert_emails" { type = list(string) default = [] }
variable "anomaly_threshold_usd" { type = number default = 25 }
variable "tags" { type = map(string) default = {} }
