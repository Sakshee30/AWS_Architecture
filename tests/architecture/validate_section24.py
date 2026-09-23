from pathlib import Path
R=Path(__file__).resolve().parents[2]
for f in ["config/limits.yaml","infrastructure/terraform/modules/finops/main.tf","infrastructure/terraform/modules/finops/variables.tf","packages/platform-sdk/src/cost-impact.ts","docs/performance/test-plan.md"]:
 assert (R/f).exists(),f
limits=(R/"config/limits.yaml").read_text()
for x in ["max_request_bytes","max_upload_bytes","max_page_size","max_query_depth","request_timeout_ms","max_batch_size","worker_concurrency","normal","peak","2x_peak","spike","soak","failure_injection"]:
 assert x in limits,x
plan=(R/"docs/performance/test-plan.md").read_text()
for x in ["N+1","full table/index scans","missing indexes","unbounded pagination","huge payloads","expensive joins","memory growth","RDS","NAT Gateway","MSK","OpenSearch","EKS","GPU","S3","data transfer","logs","AI inference"]:
 assert x in plan,x
cost=(R/"packages/platform-sdk/src/cost-impact.ts").read_text()
for x in ["advisory","assertCostCannotAuthorizeChange","Application","Environment","Service","Owner","CostCenter","nat_gateway","ai_inference"]:
 assert x in cost,x
fin=(R/"infrastructure/terraform/modules/finops/main.tf").read_text()
for x in ["aws_budgets_budget","FORECASTED","ACTUAL","aws_ce_anomaly_monitor","aws_ce_anomaly_subscription"]:
 assert x in fin,x
print("Section 24 performance/capacity/FinOps static validation passed")
