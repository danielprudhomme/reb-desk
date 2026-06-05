import { Parameter } from '@shared/models/parameter.ts';
import { createHash } from 'crypto';
import { Tx } from '@src/db/database.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import {
  getLotSizeParameters,
  getStrategyParameters,
} from '@src/constants/reb-parameters-definitions.ts';
import { ParameterSetDb, parameterSetsTable } from '@src/db/schema/parameter-set.ts';
import { ParameterSet } from '@shared/models/parameter-set.ts';

export const parameterSetService = {
  async findOrCreateTx(
    tx: Tx,
    expert: ExpertAdvisor,
    parameters: Parameter[],
  ): Promise<ParameterSetDb> {
    const parametersString = buildParametersString(
      expert,
      Object.fromEntries(parameters.map((p) => [p.name, p.value])),
    );

    const lotSizeParams = getLotSizeParameters(expert);

    const getParam = (name: string) => parameters.find((p) => p.name === name)?.value;

    const fixedLotSize: boolean = Boolean(
      (lotSizeParams.fixedLotSize && Number(getParam(lotSizeParams.fixedLotSize)) === 1) ||
      (lotSizeParams.adaptLotSize && Number(getParam(lotSizeParams.adaptLotSize)) === 0),
    );

    const [created] = await tx
      .insert(parameterSetsTable)
      .values({
        id: crypto.randomUUID(),
        parameters: parametersString,
        parametersHash: buildParametersHash(parametersString),
        initLotSize: Number(getParam(lotSizeParams.initLotSize)),
        fixedLotSize,
      })
      .returning();

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
  const keys = getStrategyParameters(expert);
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
