export default /* GraphQL */ `
  type RobotParameter {
    name: String!
    value: Float!
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
`;
