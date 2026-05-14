export default /* GraphQL */ `
  extend type Query {
    accounts: [Account!]!
    account(id: ID!): Account
  }
`;
