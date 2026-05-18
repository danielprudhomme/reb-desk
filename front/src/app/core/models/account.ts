import { Robot } from './robot';

export interface Account {
  id: string;
  name: string;
  capital: number;
  leverage: number;
  robots: Robot[];
}

export type AccountInput = Omit<Account, 'robots' | 'id'> & {
  id?: string;
};
