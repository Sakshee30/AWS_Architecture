variable "name" { type = string }
variable "cluster_arn" { type = string }
variable "cluster_name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "execution_role_arn" { type = string }
variable "task_role_arn" { type = string }

variable "container_image" {
  description = "Immutable image reference. Use repository@sha256:digest in production."
  type        = string
  validation {
    condition     = can(regex("@sha256:[a-fA-F0-9]{64}$", var.container_image))
    error_message = "container_image must be pinned by immutable sha256 digest."
  }
}

variable "container_port" { type = number default = 8080 }
variable "cpu" { type = number default = 512 }
variable "memory" { type = number default = 1024 }
variable "desired_count" { type = number default = 2 }
variable "min_capacity" { type = number default = 2 }
variable "max_capacity" { type = number default = 20 }
variable "cpu_target" { type = number default = 70 }
variable "tags" { type = map(string) default = {} }
