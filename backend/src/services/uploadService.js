// backend/src/services/uploadService.js
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Creates a mock presigned URL for uploading a file
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<{url: string, key: string}>} - Mock URL and key
 */
export const createPresignedUploadUrl = async (filename, contentType) => {
  // Generate a unique key for the file
  const extension = path.extname(filename);
  const key = `uploads/${uuidv4()}${extension}`;
  
  // Create a mock URL
  const url = `http://localhost:4000/mock-upload/${key}`;
  
  return {
    url,
    key
  };
};

/**
 * Gets a mock public URL for a file
 * @param {string} key - File key
 * @returns {string} - Mock public URL
 */
export const getPublicUrl = (key) => {
  return `http://localhost:4000/files/${key}`;
};

/**
 * Mock file deletion
 * @param {string} key - File key
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (key) => {
  console.log(`Mock delete file: ${key}`);
  return true;
};