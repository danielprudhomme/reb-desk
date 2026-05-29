export default /* GraphQL */ `
  type StrategyContext {
    id: ID!
    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!
    leverage: Int!
    capital: Float!
  }
`;
