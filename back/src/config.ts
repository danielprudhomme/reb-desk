import path from 'path';

export const APP_CONFIG = {
  frontUrl: 'http://localhost:4200',
  dataDir: 'C:\\Dev\\RebDeskData',
  dbFile: 'rebdesk.db',
  importDir: 'Imports',
  exportDir: 'Exports',
  terminalPath: 'C:\\Metatrader\\Terminaux\\Terminal 1',
};

export const DB_PATH = path.join(APP_CONFIG.dataDir, APP_CONFIG.dbFile);
export const IMPORTS_PATH = path.join(APP_CONFIG.dataDir, APP_CONFIG.importDir);
export const EXPORTS_PATH = path.join(APP_CONFIG.dataDir, APP_CONFIG.exportDir);
