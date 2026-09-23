import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('durable control store migration contains all runtime state tables', async () => {
  const sql = await readFile(
    new URL('../apps/platform-control-api/migrations/031_runtime_control_store.sql', import.meta.url),
    'utf8',
  );

  for (const table of [
    'control_runtime_state',
    'control_page_runtime',
    'control_change_request_runtime',
    'control_audit_runtime',
  ]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }

  assert.match(sql, /PRIMARY KEY\(environment, page\)/);
  assert.match(sql, /PRIMARY KEY\(environment, change_id\)/);
});
