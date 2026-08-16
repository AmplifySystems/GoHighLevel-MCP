import crypto from 'crypto';

const secretEnvNames = [
  'GHL_API_KEY',
  'GHL_BASE_URL',
  'GHL_LOCATION_ID',
  'GHL_MCP_SHARED_SECRET',
  'GHL_WEBHOOK_SECRET',
];

const sensitiveKeyPattern = /(api[-_]?key|token|secret|password|authorization|cookie|email|phone|message|body|html|text|query|address|contact|customer|conversation|locationid|location_id|userid|user_id)/i;

export function redactText(value: unknown): string {
  let output = value instanceof Error ? value.message : String(value ?? '');

  for (const name of secretEnvNames) {
    const envValue = process.env[name];
    if (envValue) output = output.split(envValue).join('[redacted]');
  }

  return output
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/private[-_\s]?integration[-_\s]?key[:=]\s*[A-Za-z0-9._~+/=-]+/gi, 'private integration key=[redacted]')
    .replace(/ghl_[A-Za-z0-9._~+/=-]+/gi, 'ghl_[redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?[0-9][0-9 .()_-]{7,}[0-9]/g, '[redacted-phone]');
}

export function formatError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${redactText(error.message)}`;
  return redactText(error);
}

export function describeSecretPresence(value: string | undefined): string {
  if (!value) return 'missing';
  return `present len=${value.length}`;
}

export function summarizeToolArguments(args: unknown): Record<string, unknown> {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return { kind: Array.isArray(args) ? 'array' : typeof args };
  }

  const keys = Object.keys(args as Record<string, unknown>).sort();
  return {
    keyCount: keys.length,
    keys,
    redactedKeys: keys.filter((key) => sensitiveKeyPattern.test(key)),
  };
}

export function safeSessionLabel(value: unknown): string {
  const raw = String(value || 'unknown');
  if (raw === 'unknown') return raw;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12);
}
