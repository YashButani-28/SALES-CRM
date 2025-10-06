import app from './app.js';
import { config } from './config/env.js';
import sequelize from './config/database.js';

const { port } = config;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message || error);
    process.exit(1);
  }
};

startServer();