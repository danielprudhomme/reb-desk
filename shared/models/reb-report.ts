import { Currency } from './currency';
import { OpitmizationModel } from './optimization-model';
import { TimeUnit } from './time-unit';

export interface RebReport {
  id: string;
  path: string;
  expert: string;
  symbol: string;
  timeframe: string;
  leverage: number;
  capital: number;
  currency: Currency;
  model: OpitmizationModel;
  startDate: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}
