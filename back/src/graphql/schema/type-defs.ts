import enums from './enums.ts';
import common from './common.ts';
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

  ${rebReportQuery}

  ${robotQuery}
  ${robotMutation}

  ${accountQuery}
  ${accountMutation}
`;
