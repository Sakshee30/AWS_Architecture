# Integration service

Third-party connection lifecycle service.

Connections carry a secret-store **reference**, never plaintext provider credentials. Non-secret provider configuration is validated separately and sensitive-looking configuration keys are rejected before persistence.
