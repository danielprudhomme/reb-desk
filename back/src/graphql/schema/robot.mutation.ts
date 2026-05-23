export default /* GraphQL */ `
  input CreateDraftRobotInput {
    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!
  }

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
    createDraftRobots(accountId: ID!, inputs: [CreateDraftRobotInput!]!): [Robot!]!
    deleteRobot(id: ID!): Boolean!
    upsertRobot(input: RobotInput!): Robot!
  }
`;
