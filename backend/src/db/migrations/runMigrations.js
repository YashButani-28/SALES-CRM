// backend/src/db/migrations/runMigrations.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Read migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files: ${migrationFiles.join(', ')}`);

    // Run each migration in a transaction
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Running migration: ${file}`);
      
      const transaction = await sequelize.transaction();
      try {
        // Execute the SQL directly
        await sequelize.query(sql, { transaction });
        await transaction.commit();
        console.log(`Migration ${file} completed successfully.`);
      } catch (error) {
        await transaction.rollback();
        console.error(`Migration ${file} failed:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  } finally {
    // Don't close the connection here as it might be needed by the application
    // await sequelize.close();
  }
};

runMigrations();