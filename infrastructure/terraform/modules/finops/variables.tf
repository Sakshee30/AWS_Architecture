variable "name" { type=string }
variable "monthly_budget_usd" { type=number }
variable "alert_emails" { type=list(string) default=[] }
variable "tags" { type=map(string) default={} }
