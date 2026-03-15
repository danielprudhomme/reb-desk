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

  enum ImportStatus {
    new
    ongoing
    done
  }

  type RebReport {
    id: ID!
    path: String!
    importStatus: ImportStatus!
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

  input RebReportInput {
    path: String!
    importStatus: ImportStatus!
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
