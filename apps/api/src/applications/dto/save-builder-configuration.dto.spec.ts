import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveBuilderConfigurationDto } from './save-builder-configuration.dto';

const component = {
  id: '2fd4e1ac-64f5-4a8a-8b3a-4a4edebd7a11',
  type: 'text',
  title: 'Overview',
  description: 'Workspace overview',
  content: 'Welcome',
  layout: { width: 'full', spacing: 'comfortable' },
};

async function validatePayload(value: unknown) {
  const dto = plainToInstance(SaveBuilderConfigurationDto, value);
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe('SaveBuilderConfigurationDto', () => {
  it('accepts a complete registered component configuration', async () => {
    await expect(validatePayload({ expectedVersion: 0, components: [component] })).resolves.toHaveLength(0);
  });

  it('rejects unregistered component types and unsupported properties', async () => {
    const errors = await validatePayload({
      expectedVersion: 0,
      components: [{ ...component, type: 'script', executable: 'alert(1)' }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects malformed layout values and missing layout configuration', async () => {
    const malformed = await validatePayload({
      expectedVersion: 0,
      components: [{ ...component, layout: { width: 'custom', spacing: 'comfortable' } }],
    });
    const missing = await validatePayload({
      expectedVersion: 0,
      components: [{ id: component.id, type: component.type, title: component.title, description: component.description, content: component.content }],
    });
    expect(malformed.length).toBeGreaterThan(0);
    expect(missing.length).toBeGreaterThan(0);
  });

  it('caps configurations at 100 components and rejects duplicate component ids', async () => {
    const tooMany = await validatePayload({ expectedVersion: 0, components: Array.from({ length: 101 }, (_, index) => ({ ...component, id: index === 0 ? component.id : '2fd4e1ac-64f5-4a8a-8b3a-4a4edebd7a' + String(index).padStart(2, '0') })) });
    const duplicate = await validatePayload({ expectedVersion: 0, components: [component, component] });
    expect(tooMany.length).toBeGreaterThan(0);
    expect(duplicate.length).toBeGreaterThan(0);
  });

  it('rejects negative or non-integer version tokens', async () => {
    const negative = await validatePayload({ expectedVersion: -1, components: [] });
    const fractional = await validatePayload({ expectedVersion: 1.5, components: [] });
    expect(negative.length).toBeGreaterThan(0);
    expect(fractional.length).toBeGreaterThan(0);
  });
});
