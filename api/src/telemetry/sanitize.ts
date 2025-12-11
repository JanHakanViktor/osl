export function bigintSafeReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function safeJsonify(obj: unknown): unknown {
  return JSON.parse(JSON.stringify(obj, bigintSafeReplacer));
}
