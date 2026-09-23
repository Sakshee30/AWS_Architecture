resource "aws_lb" "this" {
  count              = var.enabled ? 1 : 0
  name               = substr(var.name, 0, 32)
  load_balancer_type = "application"
  internal           = false
  subnets            = var.subnet_ids
  security_groups    = var.security_group_ids
  drop_invalid_header_fields = true
  enable_deletion_protection = true
  tags = var.tags
}

resource "aws_lb_target_group" "api" {
  count       = var.enabled ? 1 : 0
  name        = substr("${var.name}-api", 0, 32)
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check { path = "/health/ready" matcher = "200-399" }
  tags = var.tags
}

resource "aws_lb_listener" "https" {
  count             = var.enabled && var.certificate_arn != null ? 1 : 0
  load_balancer_arn = aws_lb.this[0].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn
  default_action { type = "forward" target_group_arn = aws_lb_target_group.api[0].arn }
}

resource "aws_lb_listener" "http_redirect" {
  count             = var.enabled ? 1 : 0
  load_balancer_arn = aws_lb.this[0].arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect { port = "443" protocol = "HTTPS" status_code = "HTTP_301" }
  }
}
