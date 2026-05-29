import { Parameter } from '@shared/models/parameter.ts';

function normalizeParameter(p: Parameter): string {
  return `${p.name.trim()}=${Number(p.value)}`;
}

export function normalizeParameters(parameters: Parameter[]): string {
  return parameters
    .map(normalizeParameter)
    .sort((a, b) => a.localeCompare(b))
    .join('|');
}
