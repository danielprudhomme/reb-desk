export default /* GraphQL */ `
  type Backtest {
    id: ID!

    reportId: ID!

    parameterSetId: ID!

    parameterSet: ParameterSet!

    passNumber: Int!
  }

  extend type Query {
    backtests: [Backtest!]!
  }
`;
