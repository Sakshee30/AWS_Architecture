-- Durable runtime state for the Platform Control Center.
-- This migration complements the normalized Section 19 model. It preserves the
-- existing /v1/control API while making its state safe across process restarts
-- and multiple control-plane replicas.

CREATE TABLE IF NOT EXISTS control_runtime_state (
  environment text PRIMARY KEY,
  config_version bigint NOT NULL DEFAULT 1 CHECK (config_version > 0),
  desired_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  actual_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_page_runtime (
  environment text NOT NULL,
  page text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(environment, page)
);

CREATE TABLE IF NOT EXISTS control_change_request_runtime (
  environment text NOT NULL,
  change_id uuid NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(environment, change_id)
);

CREATE INDEX IF NOT EXISTS ix_control_change_runtime_updated
  ON control_change_request_runtime(environment, updated_at DESC);

CREATE TABLE IF NOT EXISTS control_audit_runtime (
  audit_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  environment text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_control_audit_runtime_created
  ON control_audit_runtime(environment, created_at DESC);
