import { config } from './config';
import { runMigrations, viewStatus } from './migrate';
import { init as server } from './server';

(async () => {
  await runMigrations(config.db);
  await viewStatus(config.db);
  server(config)
})();

