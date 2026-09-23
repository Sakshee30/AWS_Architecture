resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = var.cluster_role_arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_public_access  = false
    endpoint_private_access = true
  }

  tags = var.tags
}

resource "aws_eks_node_group" "standard" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-standard"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.standard_instance_types

  scaling_config {
    desired_size = 2
    min_size     = 2
    max_size     = 10
  }

  tags = var.tags
}

resource "aws_eks_node_group" "gpu" {
  count           = var.enable_gpu_nodes ? 1 : 0
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-gpu"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.gpu_instance_types

  labels = {
    workload = "gpu"
  }

  taint {
    key    = "nvidia.com/gpu"
    value  = "true"
    effect = "NO_SCHEDULE"
  }

  scaling_config {
    desired_size = 0
    min_size     = 0
    max_size     = 10
  }

  tags = var.tags
}
