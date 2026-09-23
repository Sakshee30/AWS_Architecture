variable "name" { type = string }
variable "log_retention_days" { type = number default = 30 }
variable "alarm_topic_arn" { type = string default = null }
variable "tags" { type = map(string) default = {} }
