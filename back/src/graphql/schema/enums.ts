import symbol from '@shared/models/symbol.ts';
import timeframe from '@shared/models/timeframe.ts';

export default /* GraphQL */ `
  enum TimeUnit {
    year
    month
    week
    day
  }

  enum OptimizationModel {
    openingPriceOnly
  }

  enum ExpertAdvisor {
    candleSuite
    emaBb
    ichimoku
    rsiBreak
    strategyCreator
    autoBot
  }

  enum ImportStatus {
    new
    ongoing
    completed
  }

   enum Symbol {
    ${symbol.symbols.join('\n')}
  }

  enum Timeframe {
    ${timeframe.timeframes.join('\n')}
  }
`;
