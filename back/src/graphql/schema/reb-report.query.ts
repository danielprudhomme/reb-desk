export default /* GraphQL */ `
  type RebReport {
    id: ID!

    strategyContextId: ID!

    strategyContext: StrategyContext!

    startDate: String!

    lastValidatedDate: String

    shortTermCount: Int!

    shortTermDuration: Int!

    shortTermUnit: TimeUnit!

    longTermDuration: Int!

    longTermUnit: TimeUnit!

    backtests: [Backtest!]
  }

  extend type Query {
    rebReports: [RebReport!]!
  }
`;
