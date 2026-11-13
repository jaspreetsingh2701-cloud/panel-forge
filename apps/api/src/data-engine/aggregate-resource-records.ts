export type ResourceAggregateOperation = 'count' | 'sum' | 'average' | 'min' | 'max';

export type AggregateField = { key: string; type: string };
export type AggregateRecord = { data: Record<string, unknown> };

export function aggregateResourceRecords(
  fields: AggregateField[],
  records: AggregateRecord[],
  operation: ResourceAggregateOperation,
  field?: string,
  groupBy?: string,
) {
  if (!['count', 'sum', 'average', 'min', 'max'].includes(operation)) {
    throw new Error('Unsupported aggregation operation.');
  }
  const numericField = field ? fields.find((item) => item.key === field) : undefined;
  if (operation !== 'count' && (!numericField || numericField.type !== 'NUMBER')) {
    throw new Error('Choose a numeric resource field for this aggregation.');
  }
  if (groupBy && groupBy !== 'createdAt' && !fields.some((item) => item.key === groupBy)) {
    throw new Error('Choose a valid field for chart grouping.');
  }

  const values = records
    .map((record) => record.data[field ?? ''])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const calculate = (items: number[]) => {
    if (operation === 'count') return items.length;
    if (items.length === 0) return 0;
    if (operation === 'sum') return items.reduce((total, value) => total + value, 0);
    if (operation === 'average') return items.reduce((total, value) => total + value, 0) / items.length;
    if (operation === 'min') return Math.min(...items);
    return Math.max(...items);
  };

  const value = operation === 'count' ? records.length : calculate(values);
  const grouped = new Map<string, number[]>();
  if (groupBy) {
    for (const record of records) {
      const raw = groupBy === 'createdAt' ? undefined : record.data[groupBy];
      const label = String(raw ?? 'Unspecified');
      const current = grouped.get(label) ?? [];
      if (operation === 'count') current.push(1);
      else {
        const numeric = record.data[field ?? ''];
        if (typeof numeric === 'number' && Number.isFinite(numeric)) current.push(numeric);
      }
      grouped.set(label, current);
    }
  }
  const groups = [...grouped.entries()]
    .map(([label, items]) => ({ label, value: operation === 'count' ? items.length : calculate(items) }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 12);

  return { operation, value, groups, scanned: records.length, scanLimit: 500 };
}
