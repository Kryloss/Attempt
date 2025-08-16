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
    gmail: {
        user: process.env.GMAIL_USER || '',
        appPassword: process.env.GMAIL_APP_PASSWORD || '',
    },
    app: {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
    // Check if we have a valid MongoDB URI
    return !!config.mongodb.uri && config.mongodb.uri.trim() !== '';
};

// Helper function to check if Resend is configured
export const isResendConfigured = () => {
    // Check if we have valid Resend configuration
    return !!(config.resend.apiKey && config.resend.domain &&
        config.resend.apiKey.trim() !== '' && config.resend.domain.trim() !== '');
};

// Helper function to check if Gmail SMTP is configured
export const isGmailConfigured = () => {
    // Check if we have valid Gmail configuration
    return !!(config.gmail.user && config.gmail.appPassword &&
        config.gmail.user.trim() !== '' && config.gmail.appPassword.trim() !== '');
};

// Helper function to check if any email service is configured
export const isAnyEmailServiceConfigured = () => {
    return isResendConfigured() || isGmailConfigured();
};

// Helper function to check if we should attempt database operations
export const shouldAttemptDatabaseOperations = () => {
    return !config.isBuildTime && !config.isVercelBuild && isMongoDBConfigured();
};

// Helper function to check if we should attempt email operations
export const shouldAttemptEmailOperations = () => {
    return !config.isBuildTime && !config.isVercelBuild && isAnyEmailServiceConfigured();
};

// Helper function to check if we're in a safe environment for database operations
export const isSafeForDatabaseOperations = () => {
    return !config.isBuildTime && !config.isVercelBuild && config.isClientSide;
};

// Debug function to help troubleshoot environment variables
export const debugEnvironment = () => {
    return {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        NEXT_PHASE: process.env.NEXT_PHASE,
        MONGODB_URI: config.mongodb.uri ? 'SET' : 'NOT SET',
        RESEND_API_KEY: config.resend.apiKey ? 'SET' : 'NOT SET',
        RESEND_DOMAIN: config.resend.domain ? 'SET' : 'NOT SET',
        GMAIL_USER: config.gmail.user ? 'SET' : 'NOT SET',
        GMAIL_APP_PASSWORD: config.gmail.appPassword ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_APP_URL: config.app.url,
        isBuildTime: config.isBuildTime,
        isVercelBuild: config.isVercelBuild,
        isMongoDBConfigured: isMongoDBConfigured(),
        isResendConfigured: isResendConfigured(),
        isGmailConfigured: isGmailConfigured(),
        isAnyEmailServiceConfigured: isAnyEmailServiceConfigured(),
    };
};
