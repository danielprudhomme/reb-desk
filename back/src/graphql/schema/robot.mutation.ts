export default /* GraphQL */ `
  input InsertRobotInput {
    accountId: ID!
    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!
  }

  input UpdateRobotInput {
    id: ID!
    status: RobotStatus!
    parameterSetId: ID
  }

  extend type Mutation {
    insertRobots(inputs: [InsertRobotInput!]!): [Robot!]!
    insertRobot(input: InsertRobotInput!): Robot!
    updateRobot(input: UpdateRobotInput!): Robot!
    deleteRobot(id: ID!): Boolean!
  }
`;
