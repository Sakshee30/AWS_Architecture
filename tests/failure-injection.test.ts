import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CircuitBreaker,
  TransientDependencyError,
  readiness,
} from '../packages/platform-sdk/src/resilience.js';

test('circuit breaker stops hammering an unhealthy dependency', async () => {
  const breaker = new CircuitBreaker(2, 60_000);
  let attempts = 0;

  const failingDependency = async () => {
    attempts += 1;
    throw new TransientDependencyError('dependency unavailable');
  };

  await assert.rejects(() => breaker.run(failingDependency));
  await assert.rejects(() => breaker.run(failingDependency));
  await assert.rejects(() => breaker.run(failingDependency), /Circuit open/);

  assert.equal(attempts, 2);
});

test('optional dependency failure degrades but does not fail readiness', () => {
  const result = readiness([
    { name: 'postgres', required: true, healthy: true, degraded: false },
    {
      name: 'opensearch',
      required: false,
      healthy: false,
      degraded: true,
      fallback: 'postgres',
    },
  ]);

  assert.equal(result.ready, true);
  assert.equal(result.state, 'DEGRADED');
});
