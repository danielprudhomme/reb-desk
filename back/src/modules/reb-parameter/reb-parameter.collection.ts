import { RebParameter } from '@shared/models/reb-parameter.ts';
import { db } from '../../db/database.ts';

export function rebParameterCollection() {
  return db.getCollection('rebParameters');
}

export function createRebParameterCollection() {
  const rebParameters = db.getCollection<RebParameter>('rebParameters');

  if (!rebParameters) {
    db.addCollection<RebParameter>('rebParameters', {
      indices: ['reportId', 'name'],
    });
  }
}
