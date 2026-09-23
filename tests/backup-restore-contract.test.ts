import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('production infrastructure keeps backup and restore controls explicit', async () => {
  const [target, dr] = await Promise.all([
    readFile(
      new URL('../infrastructure/terraform/aws-target/main.tf', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../config/dr.yaml', import.meta.url), 'utf8'),
  ]);

  assert.match(target, /aws_backup_vault/);
  assert.match(target, /aws_backup_plan/);
  assert.match(target, /aws_backup_selection/);
  assert.match(target, /backup_retention/);
  assert.match(dr, /rpo/i);
  assert.match(dr, /rto/i);
  assert.match(dr, /restore/i);
});
