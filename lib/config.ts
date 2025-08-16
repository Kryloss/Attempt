// Configuration file to handle environment variables gracefully

// More comprehensive build-time detection
const isBuildTime = () => {
    // Check multiple indicators of build time
    return (
        process.env.NODE_ENV === 'production' &&
        typeof window === 'undefined' &&
        (process.env.VERCEL_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build')
    );
};

export const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || '',
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'),
    },
    resend: {
        apiKey: process.env.RESEND_API_KEY || '',
        domain: process.env.RESEND_DOMAIN || '',
    },
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isBuildTime: isBuildTime(),
    isServerSide: typeof window === 'undefined',
    isClientSide: typeof window !== 'undefined',
    isVercel: process.env.VERCEL === '1',
    isVercelBuild: process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build',
};

// Helper function to check if MongoDB is configured
export const isMongoDBConfigured = () => {
    // During build time, always return false to prevent MongoDB operations
    if (config.isBuildTime || config.isVercelBuild) {
        return false;
    }

    // Check if we have a valid MongoDB URI
    return !!config.mongodb.uri && config.mongodb.uri.trim() !== '';
};

// Helper function to check if Resend is configured
export const isResendConfigured = () => {
    // During build time, always return false to prevent Resend operations
    if (config.isBuildTime || config.isVercelBuild) {
        return false;
    }

    // Check if we have valid Resend configuration
    return !!(config.resend.apiKey && config.resend.domain &&
        config.resend.apiKey.trim() !== '' && config.resend.domain.trim() !== '');
};

// Helper function to check if we should attempt database operations
export const shouldAttemptDatabaseOperations = () => {
    return !config.isBuildTime && !config.isVercelBuild && isMongoDBConfigured();
};

// Helper function to check if we should attempt email operations
export const shouldAttemptEmailOperations = () => {
    return !config.isBuildTime && !config.isVercelBuild && isResendConfigured();
};

// Helper function to check if we're in a safe environment for database operations
export const isSafeForDatabaseOperations = () => {
    return !config.isBuildTime && !config.isVercelBuild && config.isClientSide;
};
