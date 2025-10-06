// backend/src/config/database.js
import { Sequelize } from 'sequelize';
import { config } from './env.js';

let sequelize;

if (config.databaseUrl) {
  sequelize = new Sequelize(config.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: false
    }
  );
}

export default sequelize;