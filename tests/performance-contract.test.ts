import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryFixedWindowLimiter } from '../apps/api/src/rate-limit.js';

test('development limiter remains bounded under high-cardinality traffic', async () => {
  const limiter = new MemoryFixedWindowLimiter(10, 60_000, 1_000);

  for (let index = 0; index < 10_000; index += 1) {
    await limiter.consume(`tenant-${index}`);
  }

  // The test deliberately validates behavior rather than private collection
  // internals: an early tenant may be evicted, but fresh traffic must still be
  // admitted and bounded quotas must still apply.
  const first = await limiter.consume('fresh-tenant');
  assert.equal(first.allowed, true);
  assert.equal(first.limit, 10);

  for (let index = 0; index < 9; index += 1) {
    await limiter.consume('fresh-tenant');
  }

  const blocked = await limiter.consume('fresh-tenant');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});
