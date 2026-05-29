export default /* GraphQL */ `
  type StrategyContext {
    id: ID!

    expert: ExpertAdvisor!

    symbol: String!

    timeframe: String!

    leverage: Int!

    capital: Float!
  }
`;
