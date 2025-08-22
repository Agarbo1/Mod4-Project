// backend/config/index.js
const path = require('path');
require('dotenv').config();

module.exports = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  dbFile: process.env.DB_FILE || path.resolve(__dirname, '..', 'db', 'dev.sqlite'),
  jwtConfig: {
    secret: process.env.JWT_SECRET || 'superSecretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || 604800
  }
};
