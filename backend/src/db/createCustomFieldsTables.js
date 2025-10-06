// backend/src/db/createCustomFieldsTables.js
import sequelize from '../config/database.js';

const createTables = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Create the tables directly using Sequelize queries
    await sequelize.query(`
      -- Create UUID extension if it doesn't exist
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Create custom_fields table
      CREATE TABLE IF NOT EXISTS custom_fields (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        entity VARCHAR(100) NOT NULL,
        field_type VARCHAR(50) NOT NULL,
        label VARCHAR(255) NOT NULL,
        key VARCHAR(100) NOT NULL UNIQUE,
        required BOOLEAN NOT NULL DEFAULT false,
        validation JSONB,
        default_value TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "group" VARCHAR(100),
        created_by VARCHAR(100),
        updated_by VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      -- Create custom_field_values table
      CREATE TABLE IF NOT EXISTS custom_field_values (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        entity VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
        value TEXT,
        created_by VARCHAR(100),
        updated_by VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS custom_field_values_entity_entity_id_idx 
        ON custom_field_values(entity, entity_id);
      
      -- Create function for updated_at
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS set_custom_fields_updated_at ON custom_fields;
      CREATE TRIGGER set_custom_fields_updated_at
      BEFORE UPDATE ON custom_fields
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
      
      DROP TRIGGER IF EXISTS set_custom_field_values_updated_at ON custom_field_values;
      CREATE TRIGGER set_custom_field_values_updated_at
      BEFORE UPDATE ON custom_field_values
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);

    console.log('✅ Custom fields tables created successfully.');
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
  }
};

createTables();