import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  DB_URI: process.env.DB_URI || process.env.DBURI || 'mongodb://127.0.0.1:27017/chat-app',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default config;
