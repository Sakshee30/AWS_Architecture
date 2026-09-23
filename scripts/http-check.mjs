const mode = process.argv[2] ?? 'health';
const baseUrl = process.env.API_BASE_URL?.replace(/\/$/, '');

if (!baseUrl) {
  throw new Error('API_BASE_URL is required for environment HTTP verification');
}

const authorization = process.env.API_BEARER_TOKEN
  ? { authorization: `Bearer ${process.env.API_BEARER_TOKEN}` }
  : {};

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...authorization,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(10_000),
  });

  const text = await response.text();
  return { response, text };
}

async function checkHealth() {
  const { response, text } = await request('/health/ready');
  if (!response.ok) {
    throw new Error(`Readiness check failed: ${response.status} ${text.slice(0, 300)}`);
  }
}

async function checkDastBaseline() {
  const { response, text } = await request('/health/ready');

  if (!response.ok) {
    throw new Error(`DAST readiness prerequisite failed with ${response.status}`);
  }

  const requiredHeaders = [
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
  ];

  for (const header of requiredHeaders) {
    if (!response.headers.get(header)) {
      throw new Error(`Missing security header: ${header}`);
    }
  }

  const unknown = await request('/__security_probe_missing_route__');
  if (unknown.response.status >= 500) {
    throw new Error('Unknown route generated a server error');
  }

  if (/stack|node_modules|at\s+\w+\s*\(/i.test(unknown.text)) {
    throw new Error('Public error response appears to expose implementation details');
  }

  if (/password|authorization|refresh.?token/i.test(text)) {
    throw new Error('Health response appears to expose sensitive fields');
  }
}

if (mode === 'dast') {
  await checkDastBaseline();
} else {
  await checkHealth();
}

console.log(`${mode} HTTP verification passed for ${baseUrl}`);
