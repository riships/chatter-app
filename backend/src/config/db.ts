import mongoose from 'mongoose';
import config from './env.js';

export const connectMongoDb = async (): Promise<typeof mongoose | void> => {
  try {
    const client = await mongoose.connect(config.DB_URI);
    console.log('[Database] MongoDB Connected Successfully!');
    return client;
  } catch (error: any) {
    console.error('[Database Error] Failed to connect to MongoDB:', error.message || error);
  }
};

export default connectMongoDb;
