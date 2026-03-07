export interface StorageAdapter {
    get<T>(key: string, defaultValue: T): Promise<T>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

export const localStorageAdapter: StorageAdapter = {
    get: async <T>(key: string, defaultValue: T): Promise<T> => {
        try {
            const item = localStorage.getItem(`flashpoint_${key}`);
            return item ? (JSON.parse(item) as T) : defaultValue;
        } catch (error) {
            console.error(`Error reading from storage key "${key}":`, error);
            return defaultValue;
        }
    },

    set: async <T>(key: string, value: T): Promise<void> => {
        try {
            localStorage.setItem(`flashpoint_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to storage key "${key}":`, error);
        }
    },

    remove: async (key: string): Promise<void> => {
        localStorage.removeItem(`flashpoint_${key}`);
    },

    clear: async (): Promise<void> => {
        Object.keys(localStorage)
            .filter(key => key.startsWith('flashpoint_'))
            .forEach(key => localStorage.removeItem(key));
    }
};

/**
 * Dynamic Storage Dispatcher
 * Allows switching between LocalStorage and Firestore
 */
let activeAdapter: StorageAdapter = localStorageAdapter;

export const setStorageAdapter = (adapter: StorageAdapter) => {
    activeAdapter = adapter;
};

export const storage: StorageAdapter = {
    get: (key, defaultValue) => activeAdapter.get(key, defaultValue),
    set: (key, value) => activeAdapter.set(key, value),
    remove: (key) => activeAdapter.remove(key),
    clear: () => activeAdapter.clear(),
};
