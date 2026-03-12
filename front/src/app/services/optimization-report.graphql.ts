import { gql } from 'apollo-angular';

export const GET_OPTIMIZATION_REPORTS = gql`
  query GetOptimizationReports {
    optimizationReports {
      id
      expert
      symbol
      timeframe
      leverage
      capital
      currency
      model
      startDate
      shortTermCount
      shortTermDuration
      shortTermUnit
      longTermDuration
      longTermUnit
    }
  }
`;
 