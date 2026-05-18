export default /* GraphQL */ `
  input RobotInput {
    id: ID
    accountId: ID!

    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!

    status: RobotStatus!

    parameters: [ParameterInput!]!
  }

  extend type Mutation {
    upsertRobot(input: RobotInput!): Robot!
    deleteRobot(id: ID!): Boolean!
  }
`;
