import { COMPONENT_REGISTRY, createBuilderComponent, getBuilderComponentDefinition, isBuilderComponentType } from './component-registry';
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
      description: 'Example metric · data binding comes next', content: '128',
    });
  });
  it('returns no definition for an unknown component type', () => {
    expect(getBuilderComponentDefinition('unknown')).toBeUndefined();
  });
});
