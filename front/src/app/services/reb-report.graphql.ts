import { gql } from 'apollo-angular';

export const GET_REB_REPORTS = gql`
  query GetRebReports {
    rebReports {
      id
      expert
      symbol
      timeframe
      leverage
      capital
      startDate
      shortTermCount
      shortTermDuration
      shortTermUnit
      longTermDuration
      longTermUnit

      backtests {
        id
      }
    }
  }
`;
