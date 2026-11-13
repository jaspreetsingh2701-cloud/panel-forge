export type BuilderComponentType = 'text' | 'metric' | 'table' | 'form' | 'chart';
export type BuilderPropertyKey = 'title' | 'description' | 'content';
export type BuilderLayoutWidth = 'full' | 'half' | 'third';
export type BuilderLayoutSpacing = 'compact' | 'comfortable' | 'spacious';
export type BuilderLayout = { width: BuilderLayoutWidth; spacing: BuilderLayoutSpacing };
export type BuilderDataBinding = { resourceId: string | null; columns?: string[]; mode?: 'create' | 'edit'; aggregation?: 'count' | 'sum' | 'average' | 'min' | 'max'; field?: string; groupBy?: string };
export type BuilderComponent = { id: string; type: BuilderComponentType; title: string; description: string; content: string; layout: BuilderLayout; dataBinding?: BuilderDataBinding };
export type BuilderComponentDefinition = {
  type: BuilderComponentType; label: string; category: 'Content' | 'Data'; description: string; icon: string;
  defaults: Omit<BuilderComponent, 'id' | 'type' | 'layout'>;
  properties: ReadonlyArray<{ key: BuilderPropertyKey; label: string; control: 'input' | 'textarea' }>;
};
export const COMPONENT_REGISTRY = [
  { type: 'text', label: 'Text block', category: 'Content', description: 'Add a heading and supporting copy.', icon: 'T',
    defaults: { title: 'Welcome to your workspace', description: 'A short introduction for your team.', content: 'Use this space to explain what this page is for.' },
    properties: [{ key: 'title', label: 'Heading', control: 'input' }, { key: 'content', label: 'Body text', control: 'textarea' }] },
  { type: 'metric', label: 'Metric card', category: 'Data', description: 'Highlight one important number.', icon: '↗',
    defaults: { title: 'Total orders', description: 'Live metric from a connected resource', content: '128' },
    properties: [{ key: 'title', label: 'Metric label', control: 'input' }, { key: 'description', label: 'Supporting text', control: 'input' }, { key: 'content', label: 'Preview value', control: 'input' }] },
  { type: 'table', label: 'Data table', category: 'Data', description: 'Preview a resource-backed table layout.', icon: '▤',
    defaults: { title: 'Recent records', description: 'A preview of a resource table.', content: 'Connect a resource in the next builder step.' },
    properties: [{ key: 'title', label: 'Table title', control: 'input' }, { key: 'description', label: 'Supporting text', control: 'input' }] },
  { type: 'form', label: 'Form', category: 'Data', description: 'Create a form from a resource schema.', icon: '☷',
    defaults: { title: 'Create a record', description: 'A preview of a resource-backed form.', content: 'Choose a resource to generate fields.' },
    properties: [{ key: 'title', label: 'Form title', control: 'input' }, { key: 'description', label: 'Supporting text', control: 'input' }] },
  { type: 'chart', label: 'Chart', category: 'Data', description: 'Reserve space for a data visualisation.', icon: '▥',
    defaults: { title: 'Orders over time', description: 'Grouped values from a connected resource', content: 'Choose a resource and grouping field to build a chart.' },
    properties: [{ key: 'title', label: 'Chart title', control: 'input' }, { key: 'description', label: 'Supporting text', control: 'input' }] },
] as const satisfies ReadonlyArray<BuilderComponentDefinition>;
export function getBuilderComponentDefinition(type: string) { return COMPONENT_REGISTRY.find((definition) => definition.type === type); }
export function isBuilderComponentType(value: unknown): value is BuilderComponentType {
  return typeof value === 'string' && COMPONENT_REGISTRY.some((definition) => definition.type === value);
}
export function createBuilderComponent(type: BuilderComponentType, id: string): BuilderComponent {
  const definition = getBuilderComponentDefinition(type);
  if (!definition) throw new Error('Unsupported builder component type.');
  return { id, type: definition.type, ...definition.defaults, layout: { width: 'full', spacing: 'comfortable' } };
}

/** Return a reordered copy; invalid or out-of-range moves leave the list unchanged. */
export function moveBuilderComponent<T>(items: readonly T[], sourceIndex: number, destinationIndex: number): T[] {
  if (
    sourceIndex < 0 ||
    destinationIndex < 0 ||
    sourceIndex >= items.length ||
    destinationIndex >= items.length ||
    sourceIndex === destinationIndex
  ) {
    return [...items];
  }

  const reordered = [...items];
  const [moved] = reordered.splice(sourceIndex, 1);
  reordered.splice(destinationIndex, 0, moved);
  return reordered;
}
