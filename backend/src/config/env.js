import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['PORT', 'JWT_SECRET'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasDbParams =
  process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

if (!hasDatabaseUrl && !hasDbParams) {
  throw new Error(
    'Database configuration missing. Provide DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.'
  );
}

const dbConfig = hasDatabaseUrl
  ? null
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

export const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  db: dbConfig,
  jwtSecret: process.env.JWT_SECRET,
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
};
