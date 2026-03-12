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

  enum OpitmizationModel {
    openingPriceOnly
  }

  type OptimizationReport {
    id: ID!
    expert: String!
    symbol: String!
    timeframe: String!
    leverage: Int!
    capital: Float!
    currency: Currency!
    model: OpitmizationModel!
    startDate: String!
    shortTermCount: Int!
    shortTermDuration: Int!
    shortTermUnit: TimeUnit!
    longTermDuration: Int!
    longTermUnit: TimeUnit!
  }

  input OptimizationReportInput {
    expert: String!
    symbol: String!
    timeframe: String!
    leverage: Int!
    capital: Float!
    currency: Currency!
    model: OpitmizationModel!
    startDate: String!
    shortTermCount: Int!
    shortTermDuration: Int!
    shortTermUnit: TimeUnit!
    longTermDuration: Int!
    longTermUnit: TimeUnit!
  }

  type Query {
    optimizationReports: [OptimizationReport!]!
    optimizationReport(id: ID!): OptimizationReport
  }

  type Mutation {
    createOptimizationReport(input: OptimizationReportInput!): OptimizationReport!
    deleteOptimizationReport(id: ID!): Boolean!
  }
`