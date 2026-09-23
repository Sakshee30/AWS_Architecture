variable "cluster_name" { type = string }
variable "cluster_version" {
  type    = string
  default = "1.31"
}
variable "subnet_ids" { type = list(string) }
variable "cluster_role_arn" { type = string }
variable "node_role_arn" { type = string }
variable "enable_gpu_nodes" {
  type    = bool
  default = false
}
variable "standard_instance_types" {
  type    = list(string)
  default = ["m6i.large"]
}
variable "gpu_instance_types" {
  type    = list(string)
  default = ["g5.xlarge"]
}
variable "tags" {
  type    = map(string)
  default = {}
}
