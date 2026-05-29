import enums from './enums.ts';
import common from './common.ts';
import strategyContextQuery from './strategy-context.query.ts';
import backtestQuery from './backtest.query.ts';
import parameterSetQuery from './parameter-set.query.ts';
import rebReportQuery from './reb-report.query.ts';
import accountQuery from './account.query.ts';
import accountMutation from './account.mutation.ts';
import robotQuery from './robot.query.ts';
import robotMutation from './robot.mutation.ts';

export const typeDefs = /* GraphQL */ `
  type Query
  type Mutation

  ${enums}
  ${common}

  ${strategyContextQuery}

  ${parameterSetQuery}

  ${backtestQuery}

  ${rebReportQuery}
  ${rebReportQuery}

  ${robotQuery}
  ${robotMutation}

  ${accountQuery}
  ${accountMutation}
`;
