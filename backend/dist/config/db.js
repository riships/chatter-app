import mongoose from 'mongoose';
import config from './env.js';
export const connectMongoDb = async () => {
    try {
        const client = await mongoose.connect(config.DB_URI);
        console.log('[Database] MongoDB Connected Successfully!');
        return client;
    }
    catch (error) {
        console.error('[Database Error] Failed to connect to MongoDB:', error.message || error);
    }
};
export default connectMongoDb;
