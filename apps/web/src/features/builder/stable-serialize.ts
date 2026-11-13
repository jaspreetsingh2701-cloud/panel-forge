/**
 * Canonicalize builder configuration the same way JSON persistence does:
 * object keys are sorted, undefined object properties are omitted, and
 * undefined array entries become null. This avoids false dirty states when
 * optional fields are omitted by JSON.stringify before the API receives them.
 */
export function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((entry) => entry === undefined ? 'null' : stableSerialize(entry)).join(',') + ']';
  }
  if (value !== null && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => JSON.stringify(key) + ':' + stableSerialize(entry))
      .join(',') + '}';
  }
  return JSON.stringify(value) ?? 'null';
}
