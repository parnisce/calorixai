import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface TokenCache {
    getToken: (key: string) => Promise<string | undefined | null>
    saveToken: (key: string, token: string) => Promise<void>
    clearToken?: (key: string) => void
}

const createTokenCache = (): TokenCache => {
    return {
        getToken: async (key: string) => {
            try {
                const item = await SecureStore.getItemAsync(key);
                if (item) {
                    console.log(`${key} was used from SecureStore 🔐 \n`);
                    return item;
                } else {
                    // Fallback to AsyncStorage if SecureStore fails or returns null
                    const asyncItem = await AsyncStorage.getItem(key);
                    if (asyncItem) {
                        console.log(`${key} was used from AsyncStorage 💾 \n`);
                        return asyncItem;
                    }
                    console.log('No values stored under key: ' + key);
                }
                return item;
            } catch (error) {
                console.error('SecureStore get item error, falling back to AsyncStorage: ', error);

                try {
                    const asyncItem = await AsyncStorage.getItem(key);
                    return asyncItem;
                } catch (fallbackError) {
                    console.error('AsyncStorage get item error as well: ', fallbackError);
                    return null;
                }
            }
        },
        saveToken: async (key: string, token: string) => {
            try {
                await SecureStore.setItemAsync(key, token);
            } catch (error) {
                console.error('Error saving to SecureStore, saving to AsyncStorage instead:', error);
            }
            // Always save to AsyncStorage as backup
            try {
                await AsyncStorage.setItem(key, token);
            } catch (error) {
                console.error('Error saving to AsyncStorage:', error);
            }
        },
        clearToken: async (key: string) => {
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (error) {
                console.error('Error clearing SecureStore', error);
            }
            try {
                await AsyncStorage.removeItem(key);
            } catch (error) {
                console.error('Error clearing AsyncStorage', error);
            }
        }
    };
};

export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
