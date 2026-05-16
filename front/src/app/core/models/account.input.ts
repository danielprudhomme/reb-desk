import { Account } from './account';

export type AccountInput = Omit<Account, 'robots' | 'id'> & {
  id?: string;
};
