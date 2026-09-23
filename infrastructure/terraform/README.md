# Terraform

Section 16 AWS configuration/secrets implementation.

Run from an environment directory:
1. terraform init
2. terraform fmt -check -recursive
3. terraform validate
4. terraform plan -var-file=terraform.tfvars

Never put secret values in tfvars. The secrets module creates secret containers only. Populate values through an approved operational secret workflow outside Git.