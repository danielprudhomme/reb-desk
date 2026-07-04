export default /* GraphQL */ `
  type RebReport {
    id: ID!

    expert: ExpertAdvisor!

    timeframe: Timeframe!

    symbol: Symbol!

    leverage: Int!

    capital: Float!

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
