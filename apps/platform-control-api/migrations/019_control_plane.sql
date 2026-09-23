-- Section 19 control-plane schema. Additive and forward-compatible.
CREATE TABLE IF NOT EXISTS platform_capability (
  capability_id uuid PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  criticality text NOT NULL CHECK (criticality IN ('CORE','REQUIRED','OPTIONAL','OPERATIONAL')),
  enabled boolean NOT NULL,
  desired_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  actual_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider text,
  fallback_provider text,
  health text NOT NULL DEFAULT 'UNKNOWN',
  environment text NOT NULL,
  version bigint NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_platform_capability_env_name ON platform_capability(environment,name);

CREATE TABLE IF NOT EXISTS capability_dependency (
  capability_id uuid NOT NULL REFERENCES platform_capability(capability_id) ON DELETE CASCADE,
  depends_on uuid NOT NULL REFERENCES platform_capability(capability_id) ON DELETE RESTRICT,
  dependency_type text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  fallback_capability uuid REFERENCES platform_capability(capability_id) ON DELETE SET NULL,
  PRIMARY KEY(capability_id,depends_on,dependency_type)
);

CREATE TABLE IF NOT EXISTS platform_change (
  change_id uuid PRIMARY KEY,
  environment text NOT NULL,
  requested_by text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  capability text NOT NULL,
  old_state jsonb NOT NULL,
  desired_state jsonb NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('GREEN','BLUE','AMBER','RED','LOCKED')),
  status text NOT NULL,
  impact jsonb,
  approved_by text,
  started_at timestamptz,
  completed_at timestamptz,
  rollback_change_id uuid REFERENCES platform_change(change_id)
);
CREATE INDEX IF NOT EXISTS ix_platform_change_env_requested ON platform_change(environment,requested_at DESC);

CREATE TABLE IF NOT EXISTS configuration_version (
  version bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  environment text NOT NULL,
  configuration jsonb NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_configuration_active ON configuration_version(environment) WHERE active;

CREATE TABLE IF NOT EXISTS deployment_execution (
  execution_id uuid PRIMARY KEY,
  change_id uuid NOT NULL REFERENCES platform_change(change_id),
  pipeline text NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  health_result jsonb
);

CREATE TABLE IF NOT EXISTS provider_health (
  provider text NOT NULL,
  environment text NOT NULL,
  state text NOT NULL,
  last_check timestamptz NOT NULL,
  latency integer,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY(provider,environment)
);

CREATE TABLE IF NOT EXISTS audit_event (
  audit_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  environment text NOT NULL,
  correlation_id text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  result text NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_audit_event_env_time ON audit_event(environment,timestamp DESC);
