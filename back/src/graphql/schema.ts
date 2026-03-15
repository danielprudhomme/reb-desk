import { createSchema } from 'graphql-yoga';
import { typeDefs } from './type-defs.ts';
import { rebReportResolvers } from 'src/modules/reb-report/reb-report.resolvers.ts';

export const schema = createSchema({ typeDefs, resolvers: [rebReportResolvers] });
