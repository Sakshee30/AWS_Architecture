resource "aws_cloudwatch_log_group" "platform" {
  name              = "/platform/${var.name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

locals {
  alarms = {
    error_rate         = { metric = "ErrorRate", threshold = var.error_rate_threshold, comparison = "GreaterThanThreshold" }
    slo_burn           = { metric = "SLOBurnRate", threshold = var.slo_burn_threshold, comparison = "GreaterThanThreshold" }
    queue_age          = { metric = "QueueAgeSeconds", threshold = var.queue_age_threshold, comparison = "GreaterThanThreshold" }
    dlq_growth         = { metric = "DLQGrowth", threshold = var.dlq_growth_threshold, comparison = "GreaterThanThreshold" }
    database_failure   = { metric = "DatabaseFailure", threshold = 0, comparison = "GreaterThanThreshold" }
    dependency_failure = { metric = "DependencyFailure", threshold = 0, comparison = "GreaterThanThreshold" }
    security_events    = { metric = "SecurityEvent", threshold = 0, comparison = "GreaterThanThreshold" }
  }
}

resource "aws_cloudwatch_metric_alarm" "platform" {
  for_each            = local.alarms
  alarm_name          = "${var.name}-${each.key}"
  comparison_operator = each.value.comparison
  evaluation_periods  = 2
  metric_name         = each.value.metric
  namespace           = "Platform"
  period              = 60
  statistic           = "Sum"
  threshold           = each.value.threshold
  alarm_description   = "Section 22 ${each.key} alert. Owner=${var.owner}; Dashboard=${var.dashboard_url}; Escalation=${var.escalation_route}; Runbook=${var.runbook_base_url}/${each.key}"
  alarm_actions       = var.alarm_topic_arn == null ? [] : [var.alarm_topic_arn]
  tags                = merge(var.tags,{Owner=var.owner,Severity=contains(["database_failure","security_events"],each.key)?"critical":"high"})
}
