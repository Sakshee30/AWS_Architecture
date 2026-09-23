# Terraform capability modules

These modules implement provider infrastructure, never domain behavior. Environment compositions consume them while the application core selects providers through contracts/configuration.

Section 16 modules: AppConfig, non-secret SSM Parameter Store, Secrets Manager secret containers, KMS, CloudTrail and AWS Config.