import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const IMPORTS_DIR = 'C:\\Metatrader\\Imports\\Candle Base';

export async function handleSync(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const files = await readdir(IMPORTS_DIR);
    const rebFiles = files.filter(f => f.toLowerCase().endsWith('.reb'));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: rebFiles.length, files: rebFiles }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to read imports directory', detail: String(err) }));
  }
}