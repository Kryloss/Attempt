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
    // Check if MongoDB is configured and we're not in build time
    if (!isMongoDBConfigured()) {
        if (config.isBuildTime || config.isVercelBuild) {
            console.warn('MongoDB connection attempted during build time - skipping');
            throw new Error('MongoDB connection not available during build time');
        }
        throw new Error('MongoDB not configured. Please set MONGODB_URI environment variable.');
    }

    // Additional safety check for build time
    if (!shouldAttemptDatabaseOperations()) {
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
            // Vercel-specific optimizations
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            // Retry options
            retryWrites: true,
            // Connection pooling
            maxIdleTimeMS: 30000,
            // SSL options for Atlas
            ssl: true,
            sslValidate: true,
        };

        console.log('Attempting MongoDB connection with options:', {
            uri: config.mongodb.uri ? 'SET' : 'NOT SET',
            maxPoolSize: opts.maxPoolSize,
            serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS,
            socketTimeoutMS: opts.socketTimeoutMS,
            connectTimeoutMS: opts.connectTimeoutMS
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
