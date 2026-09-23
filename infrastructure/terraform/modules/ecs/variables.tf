variable "name" { type = string }
variable "cluster_arn" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "execution_role_arn" { type = string }
variable "task_role_arn" { type = string }
variable "container_image" {
  description = "Immutable image reference. Use repository@sha256:digest in production."
  type        = string
}
variable "container_port" { type = number default = 8080 }
variable "cpu" { type = number default = 512 }
variable "memory" { type = number default = 1024 }
variable "desired_count" { type = number default = 2 }
variable "tags" { type = map(string) default = {} }
