import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from './db/graphql/schema.ts';
import { resolvers } from './db/graphql/resolvers.ts';
import { initDB } from './db/database.ts';
import { handleSync } from './routes/sync.ts';
import express from 'express';
import cors from 'cors';

async function start() {
  await initDB();

  const schema = createSchema({ typeDefs, resolvers });
  const yoga = createYoga({ schema });

  const app = express();

  app.use(cors({ origin: 'http://localhost:4200' }));

  app.use('/graphql', yoga);

  app.get('/sync', handleSync);

  app.listen(4000, () => {
    console.log('🚀 API ready');
    console.log('GraphQL: http://localhost:4000/graphql');
  });
}

start();
