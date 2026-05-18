import { gql } from 'apollo-angular';

export const GET_ACCOUNTS = gql`
  query Accounts {
    accounts {
      id
      name
      capital
      leverage
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: ID!) {
    deleteAccount(id: $id)
  }
`;

export const UPSERT_ACCOUNT = gql`
  mutation UpsertAccount($input: AccountInput!) {
    upsertAccount(input: $input) {
      id
      name
      capital
      leverage
    }
  }
`;
