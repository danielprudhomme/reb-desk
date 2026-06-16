import { db, Tx } from '@src/db/database.ts';
import { logsTable } from '@src/db/schema/log.ts';

type LogLevel = 'info' | 'warn' | 'error';

export const logService = {
  insertTx(tx: Tx, level: LogLevel, source: string, message: string, data?: unknown): void {
    tx.insert(logsTable)
      .values({
        id: crypto.randomUUID(),
        level,
        source,
        message,
        data: data ? JSON.stringify(data) : null,
        createdAt: new Date(),
      })
      .execute(); // <- no return, just execute
  },

  infoTx(tx: Tx, source: string, message: string, data?: unknown): void {
    this.insertTx(tx, 'info', source, message, data);
  },

  warnTx(tx: Tx, source: string, message: string, data?: unknown): void {
    this.insertTx(tx, 'warn', source, message, data);
  },

  errorTx(tx: Tx, source: string, message: string, data?: unknown): void {
    this.insertTx(tx, 'error', source, message, data);
  },

  insert(level: LogLevel, source: string, message: string, data?: unknown): void {
    db.insert(logsTable)
      .values({
        id: crypto.randomUUID(),
        level,
        source,
        message,
        data: data ? JSON.stringify(data) : null,
        createdAt: new Date(),
      })
      .execute();
  },

  info(source: string, message: string, data?: unknown): void {
    this.insert('info', source, message, data);
  },

  warn(source: string, message: string, data?: unknown): void {
    this.insert('warn', source, message, data);
  },

  error(source: string, message: string, data?: unknown): void {
    this.insert('error', source, message, data);
  },
};
