import express, { Router } from 'express';
import cors from 'cors';
import { APP_CONFIG } from './config.ts';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema.ts';
import { importReports } from './controllers/report.controller.ts';
import { analyze } from './controllers/analysis.controller.ts';
import { generateRebFiles } from './controllers/generate-reb-files.controller.ts';

const router = Router();

router.post('/report/import', importReports);
router.post('/analyze', analyze);
router.post('/generateRebFiles', generateRebFiles);

async function start() {
  const yoga = createYoga({ schema });

  const app = express();

  app.use(cors({ origin: APP_CONFIG.frontUrl }));
  app.use(express.json());

  app.use('', router);

  app.use('/graphql', yoga);

  app.listen(4000, () => console.log('🚀 API ready'));
}

start();
