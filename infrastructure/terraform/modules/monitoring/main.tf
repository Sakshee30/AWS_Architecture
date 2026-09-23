resource "aws_cloudwatch_log_group" "platform" {
  name              = "/platform/${var.name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}
resource "aws_cloudwatch_metric_alarm" "errors" {
  alarm_name          = "${var.name}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "Platform"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Platform 5xx threshold exceeded"
  alarm_actions       = var.alarm_topic_arn == null ? [] : [var.alarm_topic_arn]
  tags                = var.tags
}
