import { createYoga } from 'graphql-yoga';
import express from 'express';
import cors from 'cors';
import { syncRouter } from './routes/sync.route.ts';
import { initDB } from './db/init.ts';
import { schema } from './graphql/schema.ts';

async function start() {
  await initDB();

  const yoga = createYoga({ schema });

  const app = express();

  app.use(cors({ origin: 'http://localhost:4200' }));

  app.use('/graphql', yoga);

  app.use(syncRouter);

  app.listen(4000, () => {
    console.log('🚀 API ready');
    console.log('GraphQL: http://localhost:4000/graphql');
  });
}

start();
