import Loki from 'lokijs';
import { DB_PATH } from 'src/config.ts';

export const db = new Loki(DB_PATH, {
  autoload: false,
  autosave: true,
  autosaveInterval: 5000,
});
