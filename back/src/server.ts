import express from 'express';
import cors from 'cors';
import { APP_CONFIG } from './config.ts';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema.ts';
import { reportRouter } from './routes/report.route.ts';
import { analysisRouter } from './routes/analysis.route.ts';

async function start() {
  // await initDB();

  const yoga = createYoga({ schema });

  const app = express();

  app.use(cors({ origin: APP_CONFIG.frontUrl }));
  app.use(express.json());

  app.use('/report', reportRouter);
  app.use('/analysis', analysisRouter);

  app.use('/graphql', yoga);

  app.listen(4000, () => console.log('🚀 API ready'));
}

start();
