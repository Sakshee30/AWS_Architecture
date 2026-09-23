terraform {
  required_version = ">= 1.6.0"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

locals {
  tags = {
    Application = var.application_name
    Environment = "prod"
    Service     = "platform"
    Owner       = var.owner
    CostCenter  = var.cost_center
  }
}

module "platform" {
  source = "../../modules/platform-environment"

  application_name           = var.application_name
  environment                = "prod"
  aws_region                 = var.aws_region
  vpc_cidr                   = var.vpc_cidr
  azs                        = var.azs
  public_subnet_cidrs        = var.public_subnet_cidrs
  private_app_subnet_cidrs   = var.private_app_subnet_cidrs
  isolated_data_subnet_cidrs = var.isolated_data_subnet_cidrs
  enable_nat_gateway         = var.enable_nat_gateway

  enable_redis      = var.enable_redis
  enable_msk        = var.enable_msk
  enable_opensearch = var.enable_opensearch
  enable_eks        = var.enable_eks
  enable_ecs        = var.enable_ecs
  enable_gpu_nodes  = var.enable_gpu_nodes
  enable_alb        = var.enable_alb
  enable_cloudfront = var.enable_cloudfront

  container_image            = var.container_image
  eks_cluster_role_arn       = var.eks_cluster_role_arn
  eks_node_role_arn          = var.eks_node_role_arn
  certificate_arn            = var.certificate_arn
  cloudfront_certificate_arn = var.cloudfront_certificate_arn
  cloudfront_aliases         = var.cloudfront_aliases

  secret_names          = var.secret_names
  non_secret_parameters = var.non_secret_parameters
  tags                  = local.tags
}
