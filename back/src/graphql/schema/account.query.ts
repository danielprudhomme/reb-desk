export default /* GraphQL */ `
  type Account {
    id: ID!
    name: String!
    capital: Float!
    robots: [Robot!]!
  }

  extend type Query {
    accounts: [Account!]!
    account(id: ID!): Account
  }
`;
