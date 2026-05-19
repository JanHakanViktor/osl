const productionOrigins = new Set([
  'https://osl-f1.com',
  'https://www.osl-f1.com',
]);

const localDevelopmentHosts = new Set(['localhost', '127.0.0.1']);

export function isAllowedCorsOrigin(origin?: string): boolean {
  if (!origin) {
    return true;
  }

  if (productionOrigins.has(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && localDevelopmentHosts.has(url.hostname);
  } catch {
    return false;
  }
}
