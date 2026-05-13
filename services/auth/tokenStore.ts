import * as SecureStore from 'expo-secure-store';
import { logger } from '../../utils/logger';

const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_KEY = 'access_token';

// Store access token in memory only for the current session (volatile)
let accessTokenMemory: string | null = null;
// Store refresh token in memory for web, as SecureStore is not available
let refreshTokenMemory: string | null = null;
const isWeb = process.env.EXPO_OS === 'web';

// Callback for session invalidation
let onSessionInvalidated: (() => void) | null = null;

export const setSessionInvalidatedCallback = (callback: (() => void) | null): void => {
  onSessionInvalidated = callback;
};

const getWebStorage = (): Storage | null => {
  if (!isWeb || typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
};

const getWebStoredValue = (key: string): string | null => {
  try {
    const storage = getWebStorage();
    return storage ? storage.getItem(key) : null;
  } catch (error) {
    logger.error(`Error reading web storage key "${key}":`, error);
    return null;
  }
};

const setWebStoredValue = (key: string, value: string): void => {
  try {
    const storage = getWebStorage();
    storage?.setItem(key, value);
  } catch (error) {
    logger.error(`Error writing web storage key "${key}":`, error);
  }
};

const removeWebStoredValue = (key: string): void => {
  try {
    const storage = getWebStorage();
    storage?.removeItem(key);
  } catch (error) {
    logger.error(`Error removing web storage key "${key}":`, error);
  }
};

export const tokenStore = {
  async getAccessToken(): Promise<string | null> {
    if (accessTokenMemory) {
      return accessTokenMemory;
    }
    if (isWeb) {
      const webToken = getWebStoredValue(ACCESS_TOKEN_KEY);
      accessTokenMemory = webToken;
      return accessTokenMemory;
    }
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    accessTokenMemory = token;
    return accessTokenMemory;
  },

  async getRefreshToken(): Promise<string | null> {
    if (isWeb) {
      if (refreshTokenMemory) {
        return refreshTokenMemory;
      }
      refreshTokenMemory = getWebStoredValue(REFRESH_TOKEN_KEY);
      return refreshTokenMemory;
    }
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      logger.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string | null | undefined): Promise<void> {
    accessTokenMemory = accessToken;

    if (isWeb) {
      setWebStoredValue(ACCESS_TOKEN_KEY, accessToken);
      refreshTokenMemory = refreshToken || null;
      if (refreshTokenMemory) {
        setWebStoredValue(REFRESH_TOKEN_KEY, refreshTokenMemory);
      } else {
        removeWebStoredValue(REFRESH_TOKEN_KEY);
      }
    } else {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      try {
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        } else {
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
      } catch (error) {
        logger.error('Error setting/clearing refresh token:', error);
        throw error;
      }
    }
  },

  async clearTokens(): Promise<void> {
    accessTokenMemory = null;

    if (isWeb) {
      refreshTokenMemory = null;
      removeWebStoredValue(ACCESS_TOKEN_KEY);
      removeWebStoredValue(REFRESH_TOKEN_KEY);
    } else {
      try {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      } catch (error) {
        logger.error('Error clearing access token:', error);
      }

      try {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } catch (error) {
        logger.error('Error clearing refresh token:', error);
      }
    }

    if (onSessionInvalidated) {
      onSessionInvalidated();
    }
  },
};
