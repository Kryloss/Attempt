import mongoose from 'mongoose';
import { config, isMongoDBConfigured, shouldAttemptDatabaseOperations } from './config';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    // Check if MongoDB is configured
    if (!isMongoDBConfigured()) {
        throw new Error('MongoDB not configured. Please set MONGODB_URI environment variable.');
    }

    // Only block during actual build time, not during Vercel runtime
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('MongoDB connection attempted during build time - skipping');
        throw new Error('MongoDB connection not available during build time');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: config.mongodb.maxPoolSize,
            serverSelectionTimeoutMS: config.mongodb.serverSelectionTimeoutMS,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            family: 4,
            // Retry options
            retryWrites: true,
            // Connection pooling
            maxIdleTimeMS: 30000,
        };

        console.log('Attempting MongoDB connection with options:', {
            uri: config.mongodb.uri ? 'SET' : 'NOT SET',
            maxPoolSize: opts.maxPoolSize,
            serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS,
            socketTimeoutMS: opts.socketTimeoutMS,
            connectTimeoutMS: opts.connectTimeoutMS,
            NEXT_PHASE: process.env.NEXT_PHASE
        });

        cached.promise = mongoose.connect(config.mongodb.uri, opts);
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB connected successfully');
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error:', {
            message: e instanceof Error ? e.message : 'Unknown error',
            name: e instanceof Error ? e.name : 'Unknown',
            stack: e instanceof Error ? e.stack : undefined
        });

        // Reset connection cache on error
        cached.conn = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
