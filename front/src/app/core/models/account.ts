export interface Account {
  id: string;
  name: string;
  capital: number;
  leverage: number;
}

export type AccountInput = Omit<Account, 'robots' | 'id'> & {
  id?: string;
};
