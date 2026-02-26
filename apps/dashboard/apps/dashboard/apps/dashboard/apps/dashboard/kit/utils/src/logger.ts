import pino from 'pino';

export type Logger = pino.Logger;

// Create and export the Pino logger instance with configuration
export const logger: Logger = pino({
    browser: {
        asObject: true,
    },
    level: process.env.LOG_LEVEL ?? 'debug',
    base: {
        env: process.env.NODE_ENV,
    },
    errorKey: 'error',
});
