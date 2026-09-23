# Section 21 release policy

The release path is PR validation -> immutable build/SBOM/scan -> DEV -> TEST -> STAGING -> PROD. Production promotion uses the same image digest; it is never rebuilt per environment.

Repository settings must enforce no direct pushes to main, required reviews/checks, CODEOWNERS review for sensitive areas, and protected semantic-version release tags. GitHub repository protection is an administrative setting and is not claimed by this file alone.

Every production release record must map: Git commit, immutable image digest, SBOM, configuration version, database migration version and deployment execution record. Deployment strategy is canary, rolling or blue/green with health gates and automatic/manual rollback according to risk policy.
