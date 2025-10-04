import app from './app.js';
import { config } from './config/env.js';

const { port } = config;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
