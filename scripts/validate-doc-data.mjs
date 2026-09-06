import { readFile } from 'node:fs/promises';

const datasetUrl = new URL('../docs/data/splashSlogans.json', import.meta.url);
const schemaUrl = new URL('../docs/data/splashSlogans.schema.json', import.meta.url);

const [records, schema] = await Promise.all(
  [datasetUrl, schemaUrl].map(async (url) => JSON.parse(await readFile(url, 'utf8'))),
);

const errors = [];

const resolveSchema = (candidate) => {
  if (!candidate?.$ref) return candidate;
  const path = candidate.$ref.replace(/^#\//, '').split('/');
  return path.reduce((value, key) => value?.[key], schema);
};

const matchesType = (value, type) => {
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === type;
};

const validate = (value, candidate, location) => {
  const rule = resolveSchema(candidate);
  if (!rule) {
    errors.push(`${location} references an unknown schema`);
    return;
  }

  if (rule.type) {
    const types = Array.isArray(rule.type) ? rule.type : [rule.type];
    if (!types.some((type) => matchesType(value, type))) {
      errors.push(`${location} must be ${types.join(' or ')}`);
      return;
    }
  }

  if (rule.enum && !rule.enum.some((item) => Object.is(item, value))) {
    errors.push(`${location} must be one of: ${rule.enum.join(', ')}`);
  }
  if (typeof value === 'string' && rule.minLength !== undefined && value.length < rule.minLength) {
    errors.push(`${location} must contain at least ${rule.minLength} character`);
  }
  if (typeof value === 'number' && rule.minimum !== undefined && value < rule.minimum) {
    errors.push(`${location} must be at least ${rule.minimum}`);
  }
  if (typeof value === 'number' && rule.maximum !== undefined && value > rule.maximum) {
    errors.push(`${location} must be at most ${rule.maximum}`);
  }

  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) {
      errors.push(`${location} must contain at least ${rule.minItems} item`);
    }
    if (rule.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(`${location} must contain unique items`);
    }
    if (rule.items) value.forEach((item, index) => validate(item, rule.items, `${location}[${index}]`));
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of rule.required ?? []) {
      if (!(required in value)) errors.push(`${location}.${required} is required`);
    }
    const properties = rule.properties ?? {};
    for (const [name, child] of Object.entries(value)) {
      if (properties[name]) {
        validate(child, properties[name], `${location}.${name}`);
      } else if (rule.additionalProperties === false) {
        errors.push(`${location}.${name} is not defined by the schema`);
      } else if (rule.additionalProperties && typeof rule.additionalProperties === 'object') {
        validate(child, rule.additionalProperties, `${location}.${name}`);
      }
    }
  }
};

validate(records, schema, 'dataset');

if (errors.length > 0) {
  console.error(`Documentation data validation failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation data validation passed (${records.length} splash slogans).`);
}
