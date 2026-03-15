export const typeDefs = /* GraphQL */ `
  enum TimeUnit {
    year
    month
    week
    day
  }

  enum Currency {
    EUR
  }

  enum OptimizationModel {
    openingPriceOnly
  }

  enum ExpertAdvisor {
    candleSuite
    emaBb
    ichimoku
    rsiBreak
    strategyCreator
    autoBot
  }

  type RebReport {
    id: ID!
    path: String!
    expert: ExpertAdvisor!
    symbol: String!
    timeframe: String!
    leverage: Int!
    capital: Float!
    currency: Currency!
    model: OptimizationModel!
    startDate: String!
    shortTermCount: Int!
    shortTermDuration: Int!
    shortTermUnit: TimeUnit!
    longTermDuration: Int!
    longTermUnit: TimeUnit!
  }

  input RebReportInput {
    path: String!
    expert: ExpertAdvisor!
    symbol: String!
    timeframe: String!
    leverage: Int!
    capital: Float!
    currency: Currency!
    model: OptimizationModel!
    startDate: String!
    lastValidatedDate: String
    shortTermCount: Int!
    shortTermDuration: Int!
    shortTermUnit: TimeUnit!
    longTermDuration: Int!
    longTermUnit: TimeUnit!
  }

  type Query {
    rebReports: [RebReport!]!
    rebReport(id: ID!): RebReport
  }

  type Mutation {
    createRebReport(input: RebReportInput!): RebReport!
    deleteRebReport(id: ID!): Boolean!
  }
`;
