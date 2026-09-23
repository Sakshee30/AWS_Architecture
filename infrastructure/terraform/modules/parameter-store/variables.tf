variable "parameters" {
 description = "Non-secret String parameters keyed by full SSM path."
 type = map(string)
 default = {}
 validation {
  condition = alltrue([for k, v in var.parameters : !can(regex("(?i)(password|secret|token|private[_-]?key)", k))])
  error_message = "Secret-looking parameter names are forbidden. Use Secrets Manager."
 }
}
variable "tags" { type = map(string) default = {} }