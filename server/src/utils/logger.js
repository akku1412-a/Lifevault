const isTest = process.env.NODE_ENV === 'test';

const logger = {
  info: (msg, ...args) => {
    if (!isTest) console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    if (!isTest) console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.DEBUG && !isTest) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, ...args);
    }
  }
};

module.exports = logger;
