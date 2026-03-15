import { Currency } from './currency';
import { OptimizationModel } from './optimization-model';
import { TimeUnit } from './time-unit';
import { ExpertAdvisor } from './expert-advisor';

export interface RebReport {
  id: string;
  path: string;
  expert: ExpertAdvisor;
  symbol: string;
  timeframe: string;
  leverage: number;
  capital: number;
  currency: Currency;
  model: OptimizationModel;
  startDate: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}
