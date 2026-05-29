import { collections } from '@src/db/collections.ts';
import { ParameterSet } from '@src/db/models/parameter-set.ts';
import { Parameter } from '@shared/models/parameter.ts';
import { createHash } from 'crypto';

export const parameterSetService = {
  findOrCreate(strategyContextId: string, parameters: Parameter[]): ParameterSet {
    const fingerprint = buildParameterFingerprint(strategyContextId, parameters);

    const existing = collections.ParameterSet().findOne({ fingerprint });

    if (existing) return existing;

    const newSet = {
      id: crypto.randomUUID(),
      strategyContextId,
      fingerprint,
      parameters,
    };

    collections.ParameterSet().insert(newSet);

    return newSet;
  },
};

function normalizeParameter(p: Parameter): string {
  // normalisation stricte pour éviter faux doublons
  return `${p.name.trim()}=${Number(p.value)}`;
}

function normalizeParameters(parameters: Parameter[]): string {
  return parameters
    .map(normalizeParameter)
    .sort((a, b) => a.localeCompare(b))
    .join('|');
}

function buildParameterFingerprint(strategyContextId: string, parameters: Parameter[]): string {
  const normalized = [strategyContextId.trim(), normalizeParameters(parameters)].join('||');
  return createHash('sha1').update(normalized).digest('hex');
}
