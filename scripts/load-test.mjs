const baseUrl = process.env.LOAD_BASE_URL?.replace(/\/$/, '');
const path = process.env.LOAD_PATH ?? '/health/ready';
const requestedRps = Number(process.env.LOAD_RPS ?? 50);
const durationSeconds = Number(process.env.LOAD_DURATION_SECONDS ?? 10);
const maximumP95Ms = Number(process.env.LOAD_MAX_P95_MS ?? 500);
const maximumErrorRate = Number(process.env.LOAD_MAX_ERROR_RATE ?? 0.01);

if (!baseUrl) {
  throw new Error('LOAD_BASE_URL is required');
}

if (!Number.isFinite(requestedRps) || requestedRps <= 0 || requestedRps > 5_000) {
  throw new Error('LOAD_RPS must be between 1 and 5000');
}

if (
  requestedRps > 500 &&
  process.env.LOAD_ACKNOWLEDGE_TARGET !== 'true'
) {
  throw new Error(
    'LOAD_ACKNOWLEDGE_TARGET=true is required above 500 RPS to prevent accidental high-load execution',
  );
}

if (
  !Number.isFinite(durationSeconds) ||
  durationSeconds < 1 ||
  durationSeconds > 3_600
) {
  throw new Error('LOAD_DURATION_SECONDS must be between 1 and 3600');
}

const authorization = process.env.API_BEARER_TOKEN
  ? { authorization: `Bearer ${process.env.API_BEARER_TOKEN}` }
  : {};

const latencies = [];
let completed = 0;
let failed = 0;

async function hit() {
  const started = performance.now();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: authorization,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      failed += 1;
    }

    await response.arrayBuffer();
  } catch {
    failed += 1;
  } finally {
    completed += 1;
    latencies.push(performance.now() - started);
  }
}

const testStarted = performance.now();

for (let second = 0; second < durationSeconds; second += 1) {
  const batchStarted = performance.now();
  const requests = Array.from({ length: requestedRps }, () => hit());
  await Promise.all(requests);

  const elapsed = performance.now() - batchStarted;
  const remaining = 1_000 - elapsed;
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

const totalSeconds = (performance.now() - testStarted) / 1_000;
latencies.sort((left, right) => left - right);

function percentile(percent) {
  if (latencies.length === 0) return Number.POSITIVE_INFINITY;
  const index = Math.min(
    latencies.length - 1,
    Math.ceil((percent / 100) * latencies.length) - 1,
  );
  return latencies[index];
}

const result = {
  target: `${baseUrl}${path}`,
  requestedRps,
  durationSeconds,
  completed,
  failed,
  achievedRps: completed / totalSeconds,
  errorRate: completed === 0 ? 1 : failed / completed,
  p50Ms: percentile(50),
  p95Ms: percentile(95),
  p99Ms: percentile(99),
};

console.log(JSON.stringify(result, null, 2));

if (result.errorRate > maximumErrorRate) {
  throw new Error(
    `Error rate ${result.errorRate} exceeded threshold ${maximumErrorRate}`,
  );
}

if (result.p95Ms > maximumP95Ms) {
  throw new Error(
    `P95 ${result.p95Ms.toFixed(2)}ms exceeded threshold ${maximumP95Ms}ms`,
  );
}
