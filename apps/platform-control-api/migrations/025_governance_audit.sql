ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS ticket_reference text;
ALTER TABLE platform_change ADD COLUMN IF NOT EXISTS source_session text;
ALTER TABLE audit_event ADD COLUMN IF NOT EXISTS source_session text;
