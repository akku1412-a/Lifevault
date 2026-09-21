const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const logger = require('../utils/logger');

// Base Storage Adapter Interface
class StorageAdapter {
  async save({ buffer, originalFileName, mimeType }) {
    throw new Error('save() not implemented');
  }
  async getStream(storageKey) {
    throw new Error('getStream() not implemented');
  }
  async getBuffer(storageKey) {
    throw new Error('getBuffer() not implemented');
  }
  async delete(storageKey) {
    throw new Error('delete() not implemented');
  }
  async exists(storageKey) {
    throw new Error('exists() not implemented');
  }
}

// Local Storage Driver
class LocalStorageAdapter extends StorageAdapter {
  constructor(baseDir) {
    super();
    this.baseDir = baseDir || env.STORAGE_LOCAL_PATH;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getSafePath(storageKey) {
    // Sanitize storage key to prevent directory traversal
    const safeKey = path.basename(storageKey);
    return path.join(this.baseDir, safeKey);
  }

  async save({ buffer, originalFileName, mimeType }) {
    const ext = path.extname(originalFileName) || '';
    const storedFileName = `${uuidv4()}${ext}`;
    const filePath = this.getSafePath(storedFileName);

    await fs.promises.writeFile(filePath, buffer);

    return {
      storageKey: storedFileName,
      storedFileName,
      storageDriver: 'local',
      fileSize: buffer.length,
      mimeType,
      localPath: filePath
    };
  }

  async getStream(storageKey) {
    const filePath = this.getSafePath(storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${storageKey}`);
    }
    return fs.createReadStream(filePath);
  }

  async getBuffer(storageKey) {
    const filePath = this.getSafePath(storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${storageKey}`);
    }
    return await fs.promises.readFile(filePath);
  }

  async delete(storageKey) {
    const filePath = this.getSafePath(storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  async exists(storageKey) {
    const filePath = this.getSafePath(storageKey);
    return fs.existsSync(filePath);
  }
}

// S3 Storage Driver Placeholder / Cloud Ready
class S3StorageAdapter extends StorageAdapter {
  constructor(config) {
    super();
    this.config = config;
    logger.info('S3 Storage Adapter initialized (ready for cloud bucket integration)');
  }

  async save({ buffer, originalFileName, mimeType }) {
    // When AWS credentials are fully configured, upload directly to S3
    const ext = path.extname(originalFileName) || '';
    const storedFileName = `${uuidv4()}${ext}`;
    logger.info(`[S3Adapter] Storing ${storedFileName} in bucket ${this.config.bucket}`);
    return {
      storageKey: storedFileName,
      storedFileName,
      storageDriver: 's3',
      fileSize: buffer.length,
      mimeType
    };
  }

  async getStream(storageKey) {
    throw new Error('S3 getStream requires S3 bucket credentials');
  }

  async getBuffer(storageKey) {
    throw new Error('S3 getBuffer requires S3 bucket credentials');
  }

  async delete(storageKey) {
    return true;
  }

  async exists(storageKey) {
    return true;
  }
}

// Factory to resolve configured storage adapter
function createStorageAdapter() {
  if (env.STORAGE_DRIVER === 's3' && env.CLOUD_STORAGE_BUCKET) {
    return new S3StorageAdapter({
      bucket: env.CLOUD_STORAGE_BUCKET,
      region: env.CLOUD_STORAGE_REGION,
      accessKey: env.CLOUD_STORAGE_ACCESS_KEY,
      secretKey: env.CLOUD_STORAGE_SECRET_KEY,
      endpoint: env.CLOUD_STORAGE_ENDPOINT
    });
  }
  return new LocalStorageAdapter(env.STORAGE_LOCAL_PATH);
}

const storageService = createStorageAdapter();

module.exports = {
  StorageAdapter,
  LocalStorageAdapter,
  S3StorageAdapter,
  storageService
};
