export default /* GraphQL */ `
  extend type Query {
    rebReports(filter: RebReportFilter): [RebReport!]!
  }
`;
