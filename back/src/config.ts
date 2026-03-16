import path from 'path';

export const APP_CONFIG = {
  frontUrl: 'http://localhost:4200',
  dataDir: 'C:\\Metatrader\\RebDeskData',
  dbFile: 'reb-desk.db',
  importDir: 'Imports',
};

export const DB_PATH = path.join(APP_CONFIG.dataDir, APP_CONFIG.dbFile);
export const IMPORTS_PATH = path.join(APP_CONFIG.dataDir, APP_CONFIG.importDir);
