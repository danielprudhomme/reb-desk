import { ParameterSet, parameterSets } from '@src/db/schema/parameter-set.ts';
import { parameters } from '@src/db/schema/parameter.ts';
import { Parameter } from '@shared/models/parameter.ts';
import { createHash } from 'crypto';
import { normalizeParameters } from './parameter.helper.ts';
import { Tx } from '@src/db/database.ts';

export const parameterSetService = {
  async findOrCreateTx(
    tx: Tx,
    strategyContextId: string,
    params: Parameter[],
  ): Promise<ParameterSet> {
    const id = buildParameterSetKey(strategyContextId, params);

    const [created] = await tx
      .insert(parameterSets)
      .values({
        id,
        strategyContextId,
      })
      .returning();

    await tx.insert(parameters).values(
      params.map((param) => ({
        ...param,
        parameterSetId: created.id,
      })),
    );

    return created;
  },
};

function buildParameterSetKey(strategyContextId: string, parameters: Parameter[]): string {
  const normalized = [strategyContextId.trim(), normalizeParameters(parameters)].join('||');
  return createHash('sha1').update(normalized).digest('hex');
}
