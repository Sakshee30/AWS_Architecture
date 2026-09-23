locals {
  name = "${var.application_name}-${var.environment}"

  desired_state = {
    redis      = var.enable_redis
    msk        = var.enable_msk
    opensearch = var.enable_opensearch
    eks        = var.enable_eks
    ecs        = var.enable_ecs
    gpu_nodes  = var.enable_gpu_nodes
  }

  production_min_tasks = var.environment == "prod" ? 4 : 2
  production_max_tasks = var.environment == "prod" ? 40 : 20
}

resource "terraform_data" "environment_guardrails" {
  input = {
    environment = var.environment
    ecs         = var.enable_ecs
    eks         = var.enable_eks
    alb         = var.enable_alb
  }

  lifecycle {
    precondition {
      condition     = var.environment != "prod" || (var.enable_ecs != var.enable_eks)
      error_message = "Production must select exactly one compute provider: ECS or EKS."
    }

    precondition {
      condition     = var.environment != "prod" || !var.enable_ecs || var.enable_alb
      error_message = "Production ECS requires the ALB traffic path."
    }

    precondition {
      condition     = var.environment != "prod" || !var.enable_alb || var.certificate_arn != null
      error_message = "Production ALB requires a regional ACM certificate."
    }

    precondition {
      condition     = var.environment != "prod" || can(regex("@sha256:[0-9a-fA-F]{64}$", var.container_image))
      error_message = "Production container_image must be pinned by immutable sha256 digest."
    }

    precondition {
      condition     = length(var.cloudfront_aliases) == 0 || var.cloudfront_certificate_arn != null
      error_message = "CloudFront aliases require an ACM certificate in us-east-1."
    }
  }
}

module "vpc" {
  source = "../vpc"

  name                       = local.name
  cidr                       = var.vpc_cidr
  azs                        = var.azs
  public_subnet_cidrs        = var.public_subnet_cidrs
  private_app_subnet_cidrs   = var.private_app_subnet_cidrs
  isolated_data_subnet_cidrs = var.isolated_data_subnet_cidrs
  enable_nat_gateway         = var.enable_nat_gateway
  tags                       = var.tags
}

resource "aws_security_group" "app" {
  name_prefix = "${local.name}-app-"
  vpc_id      = module.vpc.vpc_id

  egress {
    description = "Secure default: VPC-local egress. Explicit external egress is added by environment policy."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = var.tags
}

resource "aws_security_group" "data" {
  name_prefix = "${local.name}-data-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = var.tags
}

resource "aws_security_group" "alb" {
  name_prefix = "${local.name}-alb-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "ALB traffic is restricted to destinations inside the application VPC."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = var.tags
}

module "kms" {
  source     = "../kms"
  alias_name = local.name
  tags       = var.tags
}

module "rds" {
  source             = "../rds"
  identifier         = local.name
  subnet_ids         = module.vpc.isolated_data_subnet_ids
  security_group_ids = [aws_security_group.data.id]
  kms_key_id         = module.kms.key_arn
  multi_az           = var.environment == "prod"
  tags               = var.tags
}

module "redis" {
  source             = "../redis"
  enabled            = var.enable_redis
  name               = local.name
  subnet_ids         = module.vpc.isolated_data_subnet_ids
  security_group_ids = [aws_security_group.data.id]
  tags               = var.tags
}

module "s3" {
  source     = "../s3"
  name       = "${local.name}-objects"
  kms_key_id = module.kms.key_arn
  tags       = var.tags
}

module "sqs" {
  source     = "../sqs"
  enabled    = true
  name       = "${local.name}-jobs"
  kms_key_id = module.kms.key_arn
  tags       = var.tags
}

module "kafka" {
  source             = "../kafka"
  enabled            = var.enable_msk
  name               = local.name
  subnet_ids         = module.vpc.isolated_data_subnet_ids
  security_group_ids = [aws_security_group.data.id]
  tags               = var.tags
}

module "opensearch" {
  source             = "../opensearch"
  enabled            = var.enable_opensearch
  domain_name        = local.name
  subnet_ids         = module.vpc.isolated_data_subnet_ids
  security_group_ids = [aws_security_group.data.id]
  kms_key_id         = module.kms.key_arn
  tags               = var.tags
}

module "parameters" {
  source     = "../parameter-store"
  parameters = var.non_secret_parameters
  tags       = var.tags
}

module "secrets" {
  source       = "../secrets"
  secret_names = var.secret_names
  kms_key_id   = module.kms.key_arn
  tags         = var.tags
}

module "appconfig" {
  source           = "../appconfig"
  application_name = var.application_name
  environment_name = var.environment

  initial_configuration = {
    version = 1

    capabilities = {
      redis = {
        enabled  = var.enable_redis
        provider = "redis"
        fallback = "memory"
      }

      kafka = {
        enabled  = var.enable_msk
        provider = "kafka"
        fallback = "outbox"
      }

      search = {
        enabled  = var.enable_opensearch
        provider = "opensearch"
        fallback = "postgres"
      }
    }
  }

  tags = var.tags
}

module "monitoring" {
  source = "../monitoring"
  name   = local.name
  tags   = var.tags
}

module "alb" {
  source = "../alb"

  enabled            = var.enable_alb
  name               = local.name
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [aws_security_group.alb.id]
  certificate_arn    = var.certificate_arn
  tags               = var.tags
}

resource "aws_ecs_cluster" "this" {
  count = var.enable_ecs ? 1 : 0
  name  = local.name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

module "ecs_task_role" {
  count = var.enable_ecs ? 1 : 0

  source          = "../iam"
  name            = "${local.name}-ecs-task"
  trusted_service = "ecs-tasks.amazonaws.com"

  policy_json = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = ["${module.s3.bucket_arn}/*"]
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [module.sqs.queue_arn]
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = ["*"]

        Condition = {
          StringEquals = {
            "aws:ResourceTag/Application" = var.application_name
          }
        }
      }
    ]
  })

  tags = var.tags
}

module "ecs" {
  count = var.enable_ecs ? 1 : 0

  source             = "../ecs"
  name               = local.name
  cluster_arn        = aws_ecs_cluster.this[0].arn
  cluster_name       = aws_ecs_cluster.this[0].name
  subnet_ids         = module.vpc.private_app_subnet_ids
  security_group_ids = [aws_security_group.app.id]
  execution_role_arn = module.ecs_task_role[0].role_arn
  task_role_arn      = module.ecs_task_role[0].role_arn
  container_image    = var.container_image
  target_group_arn   = module.alb.target_group_arn
  desired_count      = local.production_min_tasks
  min_capacity       = local.production_min_tasks
  max_capacity       = local.production_max_tasks
  tags               = var.tags

  depends_on = [module.alb, terraform_data.environment_guardrails]
}

module "eks" {
  count = var.enable_eks ? 1 : 0

  source           = "../eks"
  cluster_name     = local.name
  subnet_ids       = module.vpc.private_app_subnet_ids
  cluster_role_arn = var.eks_cluster_role_arn
  node_role_arn    = var.eks_node_role_arn
  enable_gpu_nodes = var.enable_gpu_nodes
  tags             = var.tags

  depends_on = [terraform_data.environment_guardrails]
}

module "waf" {
  source = "../waf"

  name  = local.name
  scope = "REGIONAL"
  tags  = var.tags
}

resource "aws_wafv2_web_acl_association" "alb" {
  count = var.enable_alb ? 1 : 0

  resource_arn = module.alb.arn
  web_acl_arn  = module.waf.arn

  depends_on = [module.alb, module.waf]
}

module "vpc_endpoints" {
  count = var.enable_vpc_endpoints ? 1 : 0

  source                     = "../vpc-endpoints"
  vpc_id                     = module.vpc.vpc_id
  region                     = var.aws_region
  route_table_ids            = []
  subnet_ids                 = module.vpc.private_app_subnet_ids
  security_group_ids         = [aws_security_group.app.id]
  enable_interface_endpoints = true
  tags                       = var.tags
}

module "cloudfront" {
  source = "../cloudfront"

  enabled            = var.enable_cloudfront && var.enable_alb
  name               = local.name
  origin_domain_name = module.alb.dns_name

  # The ALB is protected by the regional WAF above. A CloudFront-scoped WAF
  # requires a us-east-1 provider and remains in the dedicated edge target
  # architecture until this reusable module receives a provider alias.
  web_acl_id      = null
  certificate_arn = var.cloudfront_certificate_arn
  aliases         = var.cloudfront_aliases
  tags            = var.tags
}
