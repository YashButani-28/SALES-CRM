// backend/src/db/checkCustomField.js
import sequelize from '../config/database.js';

const checkCustomField = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if the specific custom field exists
    const [results] = await sequelize.query(`
      SELECT * FROM custom_fields WHERE id = 'd70e9533-2d3e-43bc-b902-f02ed8b4e7c8';
    `);
    
    if (results.length === 0) {
      console.log('❌ Custom field with ID d70e9533-2d3e-43bc-b902-f02ed8b4e7c8 does not exist!');
      
      // List all custom fields to see what's available
      const [allFields] = await sequelize.query(`
        SELECT id, entity, field_type, label, key FROM custom_fields LIMIT 10;
      `);
      
      console.log('Available custom fields:');
      if (allFields.length === 0) {
        console.log('No custom fields found in the database.');
      } else {
        allFields.forEach(field => {
          console.log(`- ID: ${field.id}, Entity: ${field.entity}, Key: ${field.key}, Label: ${field.label}`);
        });
      }
    } else {
      console.log('✅ Custom field found:', results[0]);
    }
  } catch (error) {
    console.error('❌ Error checking custom field:', error);
  } finally {
    await sequelize.close();
  }
};

checkCustomField();
