import { COMPONENT_REGISTRY, createBuilderComponent, getBuilderComponentDefinition, isBuilderComponentType, moveBuilderComponent } from './component-registry';
describe('builder component registry', () => {
  it('exposes unique, allowlisted component identifiers', () => {
    const types = COMPONENT_REGISTRY.map((definition) => definition.type);
    expect(new Set(types).size).toBe(types.length);
    expect(isBuilderComponentType('table')).toBe(true);
    expect(isBuilderComponentType('script')).toBe(false);
    expect(isBuilderComponentType({ type: 'table' })).toBe(false);
  });
  it('creates a component from registered defaults and a stable id', () => {
    expect(createBuilderComponent('metric', 'component-1')).toEqual({
      id: 'component-1', type: 'metric', title: 'Total orders',
      description: 'Live metric from a connected resource', content: '128',
      layout: { width: 'full', spacing: 'comfortable' },
    });
  });
  it('supports optional resource bindings without changing component defaults', () => {
    const table = createBuilderComponent('table', 'table-1');
    expect(table.dataBinding).toBeUndefined();
    expect(table.type).toBe('table');
  });
  it('supports optional resource bindings without changing component defaults', () => {
    const table = createBuilderComponent('table', 'table-1');
    expect(table.dataBinding).toBeUndefined();
    expect(table.type).toBe('table');
  });
  it('defaults components to a full-width comfortable layout', () => {
    expect(createBuilderComponent('text', 'component-layout').layout).toEqual({ width: 'full', spacing: 'comfortable' });
  });
  it('returns no definition for an unknown component type', () => {
    expect(getBuilderComponentDefinition('unknown')).toBeUndefined();
  });
  it('moves a component to the requested position without mutating the original list', () => {
    const items = ['text', 'metric', 'table'];
    expect(moveBuilderComponent(items, 0, 2)).toEqual(['metric', 'table', 'text']);
    expect(items).toEqual(['text', 'metric', 'table']);
  });
  it('keeps the order unchanged for invalid or identical positions', () => {
    const items = ['text', 'metric'];
    expect(moveBuilderComponent(items, -1, 1)).toEqual(items);
    expect(moveBuilderComponent(items, 0, 2)).toEqual(items);
    expect(moveBuilderComponent(items, 1, 1)).toEqual(items);
  });
});
