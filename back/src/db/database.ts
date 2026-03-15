import Loki from 'lokijs';

export const db = new Loki('reb-desk.db', {
  autoload: false,
  autosave: true,
  autosaveInterval: 5000,
});
