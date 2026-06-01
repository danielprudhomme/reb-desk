import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { strategyContexts } from './strategy-context.ts';
import { parameterSets } from './parameter-set.ts';
import { rebReports } from './reb-report.ts';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const backtests = sqliteTable(
  'backtest',
  {
    id: text('id').primaryKey(),

    strategyContextId: text('strategy_context_id')
      .notNull()
      .references(() => strategyContexts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    parameterSetId: text('parameter_set_id')
      .notNull()
      .references(() => parameterSets.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    reportId: text('report_id')
      .notNull()
      .references(() => rebReports.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    passNumber: integer('pass_number').notNull(),
  },
  (table) => ({
    strategyContextIdx: index('idx_backtest_strategy_context').on(table.strategyContextId),

    parameterSetIdx: index('idx_backtest_parameter_set').on(table.parameterSetId),

    reportIdx: index('idx_backtest_report').on(table.reportId),
  }),
);

export type Backtest = InferSelectModel<typeof backtests>;
export type BacktestInsert = InferInsertModel<typeof backtests>;
