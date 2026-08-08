export default /* GraphQL */ `
  type ParameterSet {
    id: ID!
    parameters: [Parameter!]!
    backtests: [ParameterSetBacktest!]!
  }

  type ParameterSetBacktest {
    id: ID!
    reportId: ID!
    passNumber: Int!
    shortTermCount: Int!
    shortTermUnit: TimeUnit!
    shortTermDuration: Int!
    longTermUnit: TimeUnit!
    longTermDuration: Int!
    shortTermResults: [BacktestResult!]!
    longTermResults: [BacktestResult!]!
  }

  type BacktestResult {
    position: Int!
    result: Float!
    trades: Int!
    profitFactor: Float!
    resultPerTrade: Float!
    drawdownAmount: Float!
    drawdownPercent: Float!
  }
`;
