// backend/src/test/testCustomFieldApi.js
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api';
let token = null;
let testFieldId = null;

const login = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    if (data.token) {
      token = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.error('❌ Login failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return false;
  }
};

const createTestField = async () => {
  try {
    const response = await fetch(`${API_URL}/custom-fields`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        entity: 'Lead',
        fieldType: 'Text',
        label: 'Test Field',
        key: `test_field_${Date.now()}`,
        required: false
      })
    });
    
    const data = await response.json();
    if (data.success && data.data.id) {
      testFieldId = data.data.id;
      console.log(`✅ Test field created with ID: ${testFieldId}`);
      return true;
    } else {
      console.error('❌ Create field failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Create field error:', error);
    return false;
  }
};

const getTestField = async () => {
  if (!testFieldId) {
    console.error('❌ No test field ID available');
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/custom-fields/${testFieldId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Test field retrieved successfully:', data.data);
      return true;
    } else {
      console.error('❌ Get field failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Get field error:', error);
    return false;
  }
};

const updateTestField = async () => {
  if (!testFieldId) {
    console.error('❌ No test field ID available');
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/custom-fields/${testFieldId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        label: 'Updated Test Field',
        required: true
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Test field updated successfully');
      return true;
    } else {
      console.error('❌ Update field failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Update field error:', error);
    return false;
  }
};

const deleteTestField = async () => {
  if (!testFieldId) {
    console.error('❌ No test field ID available');
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/custom-fields/${testFieldId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Test field deleted successfully');
      return true;
    } else {
      console.error('❌ Delete field failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Delete field error:', error);
    return false;
  }
};

const testSpecificField = async (id) => {
  try {
    // Get the field
    const getResponse = await fetch(`${API_URL}/custom-fields/${id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    
    const getData = await getResponse.json();
    console.log('GET result:', getData);
    
    if (getData.success) {
      // Update the field
      const updateResponse = await fetch(`${API_URL}/custom-fields/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          label: 'Updated Field Label',
          required: true
        })
      });
      
      const updateData = await updateResponse.json();
      console.log('UPDATE result:', updateData);
      
      // Delete the field
      const deleteResponse = await fetch(`${API_URL}/custom-fields/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('DELETE result:', deleteData);
    }
  } catch (error) {
    console.error('❌ Test specific field error:', error);
  }
};

const runTests = async () => {
  if (!await login()) return;
  
  // Test the specific field ID
  await testSpecificField('d70e9533-2d3e-43bc-b902-f02ed8b4e7c8');
  
  // Test with a new field
  if (!await createTestField()) return;
  
  if (!await getTestField()) {
    // Try to clean up even if get failed
    await deleteTestField();
    return;
  }
  
  if (!await updateTestField()) {
    // Try to clean up even if update failed
    await deleteTestField();
    return;
  }
  
  await deleteTestField();
  
  console.log('✅ All tests completed');
};

runTests();
