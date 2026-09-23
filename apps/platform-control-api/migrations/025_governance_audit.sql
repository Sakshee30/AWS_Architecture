ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS ticket_reference text;
ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS source_session text;
ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS approval_session text;
ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS execution_result jsonb;
ALTER TABLE audit_event ADD COLUMN IF NOT EXISTS source_session text;
ALTER TABLE audit_event ADD COLUMN IF NOT EXISTS ticket_reference text;
ALTER TABLE audit_event ADD COLUMN IF NOT EXISTS rollback_change_id uuid;

CREATE INDEX IF NOT EXISTS idx_platform_change_environment_requested_at ON platform_change(environment, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event_environment_timestamp ON audit_event(environment, timestamp DESC);
