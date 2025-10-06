// backend/src/db/pool.js
import sequelize from '../config/database.js';

export const verifyDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export const query = async (text, params) => {
  try {
    const [results] = await sequelize.query(text, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });
    return { rows: results || [] };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};