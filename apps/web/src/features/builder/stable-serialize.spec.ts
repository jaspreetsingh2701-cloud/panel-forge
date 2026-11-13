import { stableSerialize } from './stable-serialize';

describe('stableSerialize', () => {
  it('ignores object key insertion order', () => {
    expect(stableSerialize({ b: 2, a: 1 })).toBe(stableSerialize({ a: 1, b: 2 }));
  });

  it('treats undefined object properties as omitted by JSON persistence', () => {
    expect(stableSerialize({ dataBinding: { resourceId: 'resource-1', columns: undefined } }))
      .toBe(stableSerialize({ dataBinding: { resourceId: 'resource-1' } }));
  });

  it('preserves meaningful array order and array undefined values', () => {
    expect(stableSerialize(['first', undefined, 'third'])).toBe('["first",null,"third"]');
    expect(stableSerialize(['first', 'third'])).not.toBe(stableSerialize(['third', 'first']));
  });

  it('detects actual configuration changes', () => {
    expect(stableSerialize({ title: 'Recent records' })).not.toBe(stableSerialize({ title: 'Orders' }));
  });
});
