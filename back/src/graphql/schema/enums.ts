import symbol from '@shared/models/symbol.ts';
import timeframe from '@shared/models/timeframe.ts';
import robotStatus from '@shared/models/robot-status.ts';

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
    candleSuite,
    emaBb,
    ichimoku,
    rsiBreak,
    scBbEngulfing,
    scIchiSar,
    scRsiBb,
    scEmaRsi,
    scEmaMacd,
    scRsiEngulfing,
    scEmaSar,
    scRsiOnly,
    scStochOnly,
    autoBot
  }

  enum ImportStatus {
    new
    ongoing
    completed
  }

  enum RobotStatus {
    ${robotStatus.robotStatuses.join('\n')}
  }

   enum Symbol {
    ${symbol.symbols.join('\n')}
  }

  enum Timeframe {
    ${timeframe.timeframes.join('\n')}
  }
`;
