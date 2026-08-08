export default /* GraphQL */ `
  type Backtest {
    id: ID!

    reportId: ID!

    parameterSetId: ID!

    passNumber: Int!
  }

  extend type Query {
    backtests: [Backtest!]!
  }
`;
