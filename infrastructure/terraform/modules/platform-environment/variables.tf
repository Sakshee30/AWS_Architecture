variable "application_name" { type = string }
variable "environment" { type = string validation { condition = contains(["dev","test","staging","prod"], var.environment) error_message = "environment must be dev, test, staging, or prod." } }
variable "aws_region" { type = string default = "ap-south-1" }
variable "vpc_cidr" { type = string }
variable "azs" { type = list(string) }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_app_subnet_cidrs" { type = list(string) }
variable "isolated_data_subnet_cidrs" { type = list(string) }
variable "enable_nat_gateway" { type = bool default = true }
variable "enable_redis" { type = bool default = false }
variable "enable_msk" { type = bool default = false }
variable "enable_opensearch" { type = bool default = false }
variable "enable_eks" { type = bool default = false }
variable "enable_ecs" { type = bool default = true }
variable "enable_gpu_nodes" { type = bool default = false }
variable "enable_alb" { type = bool default = true }
variable "enable_cloudfront" { type = bool default = true }
variable "enable_vpc_endpoints" { type = bool default = true }
variable "container_image" { type = string }
variable "eks_cluster_role_arn" { type = string default = null }
variable "eks_node_role_arn" { type = string default = null }
variable "certificate_arn" { type = string default = null }
variable "cloudfront_certificate_arn" { type = string default = null }
variable "cloudfront_aliases" { type = list(string) default = [] }
variable "secret_names" { type = set(string) default = [] }
variable "non_secret_parameters" { type = map(string) default = {} }
variable "tags" { type = map(string) default = {} }
