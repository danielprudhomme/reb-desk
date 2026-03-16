import { createSchema } from 'graphql-yoga';
import { typeDefs } from './type-defs.ts';
import { rebReportResolvers } from 'src/graphql/resolvers/reb-report.resolvers.ts';

export const schema = createSchema({ typeDefs, resolvers: [rebReportResolvers] });
