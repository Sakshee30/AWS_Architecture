variable "aws_region" {
  type = string
  default = "ap-south-1"
}
variable "application_name" { type = string }
variable "owner" { type = string }
variable "cost_center" { type = string }
variable "vpc_cidr" { type = string }
variable "azs" { type = list(string) }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_app_subnet_cidrs" { type = list(string) }
variable "isolated_data_subnet_cidrs" { type = list(string) }
variable "enable_nat_gateway" {
  type = bool
  default = true
}
variable "enable_redis" {
  type = bool
  default = false
}
variable "enable_msk" {
  type = bool
  default = false
}
variable "enable_opensearch" {
  type = bool
  default = false
}
variable "enable_eks" {
  type = bool
  default = false
}
variable "enable_ecs" {
  type = bool
  default = true
}
variable "enable_gpu_nodes" {
  type = bool
  default = false
}
variable "enable_alb" {
  type = bool
  default = true
}
variable "container_image" {
  type = string
  description = "Immutable image reference repository@sha256:digest."
  validation {
    condition = can(regex("@sha256:[a-fA-F0-9]{64}$", var.container_image))
    error_message = "container_image must be pinned to an immutable sha256 digest."
  }
}
variable "eks_cluster_role_arn" {
  type = string
  default = null
}
variable "eks_node_role_arn" {
  type = string
  default = null
}
variable "secret_names" {
  type = set(string)
  default = []
}
variable "non_secret_parameters" {
  type = map(string)
  default = {}
}
