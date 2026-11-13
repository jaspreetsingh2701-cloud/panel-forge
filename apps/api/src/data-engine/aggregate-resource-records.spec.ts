import { aggregateResourceRecords } from './aggregate-resource-records';

describe('aggregateResourceRecords', () => {
  const fields = [{ key: 'amount', type: 'NUMBER' }, { key: 'status', type: 'TEXT' }];
  const records = [
    { data: { amount: 10, status: 'Paid' } },
    { data: { amount: 20, status: 'Paid' } },
    { data: { amount: 5, status: 'Open' } },
  ];

  it('calculates count and numeric aggregates', () => {
    expect(aggregateResourceRecords(fields, records, 'count').value).toBe(3);
    expect(aggregateResourceRecords(fields, records, 'sum', 'amount').value).toBe(35);
    expect(aggregateResourceRecords(fields, records, 'average', 'amount').value).toBeCloseTo(11.6667);
    expect(aggregateResourceRecords(fields, records, 'min', 'amount').value).toBe(5);
    expect(aggregateResourceRecords(fields, records, 'max', 'amount').value).toBe(20);
  });

  it('groups values for chart previews', () => {
    expect(aggregateResourceRecords(fields, records, 'count', undefined, 'status').groups)
      .toEqual([{ label: 'Paid', value: 2 }, { label: 'Open', value: 1 }]);
  });

  it('rejects non-numeric aggregation fields and unknown group fields', () => {
    expect(() => aggregateResourceRecords(fields, records, 'sum', 'status')).toThrow('numeric');
    expect(() => aggregateResourceRecords(fields, records, 'count', undefined, 'missing')).toThrow('valid field');
  });
});
