export default /* GraphQL */ `
  input RobotInput {
    id: ID

    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!

    status: RobotStatus!

    parameters: [ParameterInput!]!
  }

  extend type Mutation {
    upsertRobot(input: RobotInput!): Robot!
  }
`;
