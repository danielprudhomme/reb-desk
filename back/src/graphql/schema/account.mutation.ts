export default /* GraphQL */ `
  input AccountInput {
    id: ID

    name: String!
    capital: Float!

    robots: [RobotInput!]!
  }

  extend type Mutation {
    upsertAccount(input: AccountInput!): Account!
  }
`;
