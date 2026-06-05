export default /* GraphQL */ `
  type Account {
    id: ID!
    name: String!
    capital: Float!
    leverage: Float!
  }

  extend type Query {
    accounts: [Account!]!
    account(id: ID!): Account
  }
`;
