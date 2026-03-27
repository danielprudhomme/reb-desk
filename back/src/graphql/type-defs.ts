export const typeDefs = /* GraphQL */ `
  enum TimeUnit {
    year
    month
    week
    day
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
    completed
  }

  type RebParameter {
    reportId: ID!
    name: String!
    values: [Float!]!
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
    model: OptimizationModel!

    startDate: String!
    lastValidatedDate: String

    shortTermCount: Int!
    shortTermDuration: Int!
    shortTermUnit: TimeUnit!

    longTermDuration: Int!
    longTermUnit: TimeUnit!

    parameters: [RebParameter!]!
  }

  input ParameterFilter {
    name: String!
    value: Float
    min: Float
    max: Float
  }

  input RebReportFilter {
    parameters: [ParameterFilter!]
  }

  type Query {
    rebReports(filter: RebReportFilter): [RebReport!]!
    rebReport(id: ID!): RebReport
  }

  type Mutation {
    createRebReport: RebReport!
    deleteRebReport(id: ID!): Boolean!
  }
`;
