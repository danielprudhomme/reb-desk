import { ParameterSet } from '@src/db/schema/parameter-set.ts';
import { Parameter } from '@shared/models/parameter.ts';
import { createHash } from 'crypto';
import { normalizeParameters } from './parameter.helper.ts';

// export const parameterSetService = {
//   findOrCreate(strategyContextId: string, parameters: Parameter[]): ParameterSet {
//     const fingerprint = buildParameterFingerprint(strategyContextId, parameters);

//     const existing = collections.ParameterSet().findOne({ fingerprint });

//     if (existing) return existing;

//     const newSet = {
//       id: crypto.randomUUID(),
//       strategyContextId,
//       fingerprint,
//       parameters,
//     };

//     collections.ParameterSet().insert(newSet);

//     return newSet;
//   },
// };

// function buildParameterFingerprint(strategyContextId: string, parameters: Parameter[]): string {
//   const normalized = [strategyContextId.trim(), normalizeParameters(parameters)].join('||');
//   return createHash('sha1').update(normalized).digest('hex');
// }
