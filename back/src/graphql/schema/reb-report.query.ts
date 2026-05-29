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

  extend type Query {
    rebReports(filter: RebReportFilter): [RebReport!]!
  }
`;
