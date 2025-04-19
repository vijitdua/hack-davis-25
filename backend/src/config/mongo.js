import mongoose from 'mongoose';
import { env } from './env.js'; // or wherever your Mongo URI is stored

export const connectToDB = async () => {
    try {
        await mongoose.connect(env.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};
