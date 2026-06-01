import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DB_PATH } from '../config.ts';
import * as schema from './schema/index.ts';

const sqlite = new Database(DB_PATH);
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tx = Parameters<typeof db.transaction>[0] extends (tx: infer T) => any ? T : never;
