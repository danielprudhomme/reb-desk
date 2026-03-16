import { createYoga } from 'graphql-yoga';
import express from 'express';
import cors from 'cors';
import { importRouter } from './routes/import.route.ts';
import { initDB } from './db/init.ts';
import { schema } from './graphql/schema.ts';
import { APP_CONFIG } from './config.ts';

async function start() {
  await initDB();

  const yoga = createYoga({ schema });

  const app = express();

  app.use(cors({ origin: APP_CONFIG.frontUrl }));
  app.use(express.json());

  app.use(importRouter);

  app.use('/graphql', yoga);

  app.listen(4000, () => console.log('🚀 API ready'));
}

start();
