const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25;

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'lifevault_default_jwt_secret_32_chars_long!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  STORAGE_LOCAL_PATH: path.resolve(__dirname, '../../', process.env.STORAGE_LOCAL_PATH || './uploads'),
  MAX_FILE_SIZE_MB: maxFileSizeMb,
  MAX_FILE_SIZE_BYTES: maxFileSizeMb * 1024 * 1024,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/jpeg,image/png,image/webp',
  CLOUD_STORAGE_BUCKET: process.env.CLOUD_STORAGE_BUCKET || '',
  CLOUD_STORAGE_REGION: process.env.CLOUD_STORAGE_REGION || 'us-east-1',
  CLOUD_STORAGE_ACCESS_KEY: process.env.CLOUD_STORAGE_ACCESS_KEY || '',
  CLOUD_STORAGE_SECRET_KEY: process.env.CLOUD_STORAGE_SECRET_KEY || '',
  CLOUD_STORAGE_ENDPOINT: process.env.CLOUD_STORAGE_ENDPOINT || ''
};

module.exports = env;
