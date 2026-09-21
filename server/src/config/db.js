const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let memoryServerInstance = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    logger.info('No MONGODB_URI configured. Initializing embedded MongoMemoryServer for development/testing...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    uri = memoryServerInstance.getUri();
    logger.info(`Embedded MongoMemoryServer started successfully at ${uri}`);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host || 'embedded-memory'}`);
    return conn.connection;
  } catch (err) {
    logger.warn(`Failed to connect to configured MONGODB_URI (${err.message}). Falling back to MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const fallbackUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      logger.info(`Fallback MongoMemoryServer connected at ${fallbackUri}`);
      return conn.connection;
    } catch (fallbackErr) {
      logger.error('Critical database connection failure:', fallbackErr);
      throw fallbackErr;
    }
  }
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}

module.exports = { connectDB, closeDB };
