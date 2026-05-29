export default /* GraphQL */ `
  type RebReport {
    id: ID!

    strategyContext: StrategyContext!

    fingerprint: String!

    path: String!

    importStatus: ImportStatus!

    model: OptimizationModel!

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
