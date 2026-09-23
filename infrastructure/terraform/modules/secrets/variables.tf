variable "secret_names" { description = "Secret containers only; values are never accepted." type = set(string) default = [] }
variable "kms_key_id" { type = string default = null }
variable "recovery_window_in_days" { type = number default = 30 }
variable "tags" { type = map(string) default = {} }