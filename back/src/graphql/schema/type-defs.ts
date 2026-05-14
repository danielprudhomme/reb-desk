import enums from './enums.ts';

import rebReportTypes from './reb-report/reb-report.types.ts';
import rebReportQuery from './reb-report/reb-report.query.ts';

import accountTypes from './account/account.types.ts';
import accountQuery from './account/account.query.ts';

export const typeDefs = /* GraphQL */ `
  type Query

  ${enums}

  ${rebReportTypes}
  ${rebReportQuery}

  ${accountTypes}
  ${accountQuery}
`;
