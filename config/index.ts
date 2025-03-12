import { ENV } from './env';

interface ConfigStore {
    [key: string]: any;
}

// Define your config store
const configStore: ConfigStore = {
    env: ENV,
    // You can add more config objects here
    // example: database: { ... },
    // example: auth: { ... },
};

/**
 * Get a config value using dot notation
 * @param path - Path to the config value (e.g., 'env.API_BASE_URL')
 * @param defaultValue - Default value if the path doesn't exist
 * @returns The config value or default value
 */
export function config(path: string, defaultValue: any = null): any {
    const parts = path.split('.');
    let current: any = configStore;

    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return defaultValue;
        }
    }

    return current ?? defaultValue;
}