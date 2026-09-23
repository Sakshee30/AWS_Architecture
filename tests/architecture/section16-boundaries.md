# Section 16 architecture gates
1. Domain/application packages must not import AWS SDKs.
2. Browser/frontend code must not contain AWS credentials or secret values.
3. Secret APIs/models may expose metadata, never plaintext values.
4. Non-secret configuration and secret references must remain separate.
5. Production configuration must fail validation before deployment when required secret references are missing.
