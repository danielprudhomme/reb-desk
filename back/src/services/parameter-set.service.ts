import { Parameter } from '@shared/models/parameter.ts';
import { createHash } from 'crypto';
import { Tx } from '@src/db/database.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { ParameterSetDb, parameterSetsTable } from '@src/db/schema/parameter-set.ts';
import { ParameterSet } from '@shared/models/parameter-set.ts';
import { getParameters } from '@src/constants/reb-parameters-definitions.ts';

export const parameterSetService = {
  findOrCreateTx(tx: Tx, expert: ExpertAdvisor, parameters: Parameter[]): ParameterSetDb {
    const parametersString = buildParametersString(
      expert,
      Object.fromEntries(parameters.map((p) => [p.name, p.value])),
    );

    const [created] = tx
      .insert(parameterSetsTable)
      .values({
        id: buildParametersHash(parametersString),
        parameters: parametersString,
      })
      .returning()
      .all();

    return created;
  },

  mapDbToModel(db: ParameterSetDb): ParameterSet {
    const parameters = db.parameters.split('|').map((param) => {
      const [name, value] = param.split('=');
      return { name, value: Number(value) } as Parameter;
    });

    return { id: db.id, parameters };
  },
};

function buildParametersString(expert: ExpertAdvisor, params: Record<string, unknown>): string {
  const keys = getParameters(expert);
  return keys.map((key) => `${key}=${normalizeValue(params[key])}`).join('|');
}

function buildParametersHash(parametersString: string): string {
  return createHash('sha256').update(parametersString).digest('hex');
}

function normalizeValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return value.toFixed(10).replace(/\.?0+$/, '');
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
