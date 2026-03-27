import { gql } from 'apollo-angular';

export const GET_REB_REPORTS = gql`
  query GetRebReports {
    rebReports {
      id
      path
      importStatus
      expert
      symbol
      timeframe
      leverage
      capital
      model
      startDate
      shortTermCount
      shortTermDuration
      shortTermUnit
      longTermDuration
      longTermUnit

      parameters {
        name
        values
      }
    }
  }
`;
