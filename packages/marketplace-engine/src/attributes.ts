export interface CategoryAttributeDef {
  id: string;
  name: string;
  key: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'DATE';
  isRequired: boolean;
  options?: string | null;
}

export interface SubmittedAttribute {
  attributeId: string;
  value: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateDynamicAttributes = (
  schema: CategoryAttributeDef[],
  submitted: SubmittedAttribute[]
): ValidationResult => {
  const errors: string[] = [];
  const submittedMap = new Map(submitted.map((s) => [s.attributeId, s.value]));

  for (const attr of schema) {
    const val = submittedMap.get(attr.id);

    if (attr.isRequired && (val === undefined || val === null || val === '')) {
      errors.push(`Attribute '${attr.name}' is required.`);
      continue;
    }

    if (val !== undefined && val !== null && val !== '') {
      if (attr.type === 'NUMBER') {
        const num = Number(val);
        if (isNaN(num)) {
          errors.push(`Attribute '${attr.name}' must be a valid number.`);
        }
      } else if (attr.type === 'BOOLEAN') {
        if (val !== 'true' && val !== 'false' && val !== '1' && val !== '0') {
          errors.push(`Attribute '${attr.name}' must be a boolean.`);
        }
      } else if (attr.type === 'SELECT' && attr.options) {
        const allowed = attr.options.split(',').map((o) => o.trim().toUpperCase());
        if (!allowed.includes(val.trim().toUpperCase())) {
          errors.push(`Attribute '${attr.name}' must be one of: ${attr.options}.`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
