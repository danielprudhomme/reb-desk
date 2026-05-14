import symbol from '@shared/models/symbol.ts';
import timeframe from '@shared/models/timeframe.ts';

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

  type RobotParameter {
    name: String!
    value: Float!
  }

  enum Timeframe {
    ${timeframe.timeframes.join('\n')}
  }

  enum Symbol {
    ${symbol.symbols.join('\n')}
  }

  type Robot {
    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!
    parameters: [RobotParameter!]!
  }

  type Account {
    id: ID!
    name: String!
    robots: [Robot!]!
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

    accounts: [Account!]!
    account(id: ID!): Account
  }
`;
