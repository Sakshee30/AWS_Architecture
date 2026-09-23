resource "aws_budgets_budget" "monthly" {
 name="${var.name}-monthly"; budget_type="COST"; limit_amount=tostring(var.monthly_budget_usd); limit_unit="USD"; time_unit="MONTHLY"
 dynamic "notification" { for_each=length(var.alert_emails)>0?[1]:[]; content { comparison_operator="GREATER_THAN"; threshold=80; threshold_type="PERCENTAGE"; notification_type="FORECASTED"; subscriber_email_addresses=var.alert_emails } }
}
resource "aws_ce_anomaly_monitor" "services" { name="${var.name}-services"; monitor_type="DIMENSIONAL"; monitor_dimension="SERVICE" }
