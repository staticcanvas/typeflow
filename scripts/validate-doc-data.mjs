import { readFile } from 'node:fs/promises';

const datasetUrl = new URL('../docs/data/splashSlogans.json', import.meta.url);
const schemaUrl = new URL('../docs/data/splashSlogans.schema.json', import.meta.url);

const [records, schema] = await Promise.all(
  [datasetUrl, schemaUrl].map(async (url) => JSON.parse(await readFile(url, 'utf8'))),
);

const errors = [];
const itemSchema = schema.items;
const allowedProperties = new Set(Object.keys(itemSchema.properties));

if (!Array.isArray(records) || records.length < schema.minItems) {
  errors.push(`dataset must contain at least ${schema.minItems} record`);
} else {
  records.forEach((record, index) => {
    const location = `record ${index + 1}`;
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push(`${location} must be an object`);
      return;
    }

    for (const required of itemSchema.required) {
      if (typeof record[required] !== 'string' || record[required].trim() === '') {
        errors.push(`${location}.${required} must be a non-empty string`);
      }
    }

    if (itemSchema.additionalProperties === false) {
      for (const name of Object.keys(record)) {
        if (!allowedProperties.has(name)) errors.push(`${location}.${name} is not defined by the schema`);
      }
    }

    for (const [name, value] of Object.entries(record)) {
      const property = itemSchema.properties[name];
      if (!property) continue;

      if (property.type === 'string' && typeof value !== 'string') errors.push(`${location}.${name} must be a string`);
      if (property.type === 'boolean' && typeof value !== 'boolean') errors.push(`${location}.${name} must be a boolean`);
      if (property.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) errors.push(`${location}.${name} must be a finite number`);
      if (property.type === 'integer' && !Number.isInteger(value)) errors.push(`${location}.${name} must be an integer`);
      if (property.enum && !property.enum.includes(value)) errors.push(`${location}.${name} must be one of: ${property.enum.join(', ')}`);
      if (typeof value === 'number' && property.minimum !== undefined && value < property.minimum) errors.push(`${location}.${name} must be at least ${property.minimum}`);
      if (typeof value === 'number' && property.maximum !== undefined && value > property.maximum) errors.push(`${location}.${name} must be at most ${property.maximum}`);
    }
  });
}

if (errors.length > 0) {
  console.error(`Documentation data validation failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation data validation passed (${records.length} splash slogans).`);
}
