import { getApiBaseUrl } from './apiEndpointPreference';
import { tokenStore } from '../auth/tokenStore';
import { logger } from '../../utils/logger';

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
  endpoint: string;
  options: unknown;
}

class RefreshFailureError extends Error {
  readonly shouldInvalidateSession: boolean;

  constructor(message: string, shouldInvalidateSession: boolean = false) {
    super(message);
    this.name = 'RefreshFailureError';
    this.shouldInvalidateSession = shouldInvalidateSession;
  }
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

type RetryRequest = <T>(endpoint: string, options: unknown) => Promise<T>;

export const handleTokenRefresh = async <T>(
  baseURL: string,
  retryRequest: RetryRequest,
  endpoint: string,
  options: unknown
): Promise<T> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token: string) => {
          const newOptions = {
            ...(options as Record<string, unknown>),
            headers: { ...((options as Record<string, unknown>).headers as Record<string, string>), Authorization: `Bearer ${token}` },
          };
          resolve(retryRequest(endpoint, newOptions));
        },
        reject: (err: Error) => {
          reject(err);
        },
        endpoint,
        options,
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) {
      logger.warn('[TokenRefresh] No refresh token - session invalid');
      throw new RefreshFailureError('Session expired. Please login again.', true);
    }

    const refreshEndpoint = `${getApiBaseUrl()}/auth/refresh`;
    const response = await fetch(refreshEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.warn(`[TokenRefresh] HTTP ${response.status}: ${errorText}`);
      const shouldInvalidateSession = response.status === 401 || response.status === 403;
      const message = shouldInvalidateSession
        ? 'Session expired. Please login again.'
        : `Token refresh failed: ${response.status}`;
      throw new RefreshFailureError(
        message,
        shouldInvalidateSession
      );
    }

    const responseData = await response.json();
    
    // We expect access_token and refresh_token
    const accessToken = responseData.access_token || responseData.data?.token;
    const newRefreshToken = responseData.refresh_token || responseData.data?.refreshToken;
    const nextRefreshToken = newRefreshToken ?? refreshToken;

    if (!accessToken) {
      throw new RefreshFailureError('Invalid refresh response', true);
    }

    await tokenStore.setTokens(accessToken, nextRefreshToken);

    processQueue(null, accessToken);

    const newOptions = {
      ...(options as Record<string, unknown>),
      headers: { ...((options as Record<string, unknown>).headers as Record<string, string>), Authorization: `Bearer ${accessToken}` },
    };
    return retryRequest(endpoint, newOptions);

  } catch (error) {
    if (
      error instanceof RefreshFailureError &&
      error.shouldInvalidateSession
    ) {
      await tokenStore.clearTokens();
    }
    processQueue(error as Error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
};
