output "secret_metadata" {
  value = {
    for name, secret in aws_secretsmanager_secret.this :
    name => {
      arn                = secret.arn
      name               = secret.name
      rotation_configured = contains(keys(var.rotation), name)
    }
  }
}