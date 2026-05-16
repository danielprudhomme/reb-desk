export default /* GraphQL */ `
  input AccountInput {
    id: ID
    name: String!
    capital: Float!
    leverage: Float!
  }

  extend type Mutation {
    upsertAccount(input: AccountInput!): Account!
    deleteAccount(id: ID!): Boolean!
  }
`;
