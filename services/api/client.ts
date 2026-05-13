import { handleTokenRefresh } from './tokenRefresh';
import { getApiBaseUrl } from './apiEndpointPreference';
import { tokenStore } from '../auth/tokenStore';
import { logger } from '../../utils/logger';
import { Platform } from 'react-native';

interface FileAsset {
  uri: string;
  type?: string;
  name?: string;
}

const isFileAsset = (value: unknown): value is FileAsset => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return 'uri' in value;
};

const appendFileToFormData = async (
  formData: FormData,
  key: string,
  asset: FileAsset
): Promise<void> => {
  const contentType = asset.type || 'application/octet-stream';
  const fileName = asset.name || 'file';

  if (process.env.EXPO_OS === 'web') {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: contentType });
    formData.append(key, file);
    return;
  }

  formData.append(key, {
    uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
    type: contentType,
    name: fileName,
  } as unknown as Blob);
};

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
  hasAttachment?: boolean;
}

const AUTH_REFRESH_EXCLUDED_PATHS = new Set<string>([
  '/auth/signin',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
]);

const shouldSkipTokenRefresh = (endpoint: string): boolean => {
  try {
    const parsed = endpoint.startsWith('http')
      ? new URL(endpoint)
      : new URL(endpoint, 'https://local.invalid');
    return AUTH_REFRESH_EXCLUDED_PATHS.has(parsed.pathname);
  } catch {
    return AUTH_REFRESH_EXCLUDED_PATHS.has(endpoint.split('?')[0] || endpoint);
  }
};

export class ApiClient {
  get baseURL(): string {
    return getApiBaseUrl();
  }

  async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const baseURL = this.baseURL;
    const url = `${baseURL}${endpoint}`;
    const token = await tokenStore.getAccessToken();
    const startTime = Date.now();

    const headers = new Headers(options.headers);

    if (!options.hasAttachment && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    logger.debug(`[API] ${options.method || 'GET'} ${url}`);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        let requestBody: BodyInit | Record<string, unknown> | null | undefined = options.body;

        if (requestBody && options.hasAttachment && typeof requestBody === 'object' && !(requestBody instanceof FormData)) {
          const formData = new FormData();
          for (const key in (requestBody as Record<string, unknown>)) {
            const value = (requestBody as Record<string, unknown>)[key];

            if (Array.isArray(value)) {
              for (const item of value as unknown[]) {
                if (isFileAsset(item)) {
                  await appendFileToFormData(formData, key, item);
                } else if (item !== undefined && item !== null) {
                  formData.append(key, String(item));
                }
              }
            } else if (isFileAsset(value)) {
              await appendFileToFormData(formData, key, value);
            } else if (value !== undefined) {
              // Ensure we stringify object values properly for formData if they are plain objects
              if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          }
          requestBody = formData;
        } else if (requestBody && !options.hasAttachment && typeof requestBody === 'object' && !(requestBody instanceof FormData) && !(requestBody instanceof Blob) && !(requestBody instanceof URLSearchParams)) {
          requestBody = JSON.stringify(requestBody);
        }

        const response = await fetch(url, {
          method: options.method,
          headers,
          body: requestBody as BodyInit | null,
        });

        const duration = Date.now() - startTime;

        if (!response.ok) {
          if (response.status === 401 && !shouldSkipTokenRefresh(endpoint)) {
            return handleTokenRefresh<T>(
              baseURL,
              (ep, op) => this.makeRequest(ep, op as RequestOptions),
              endpoint,
              { ...options }
            );
          }

          let errorDetails = `HTTP ${response.status} ${url} (${duration}ms)`;
          try {
            const errorJson = await response.json();
            errorDetails += ` Response: ${JSON.stringify(errorJson)}`;
          } catch {
            const errorText = await response.text().catch(() => '');
            if (errorText) {
              errorDetails += ` ResponseBody: ${errorText}`;
            }
          }

          logger.error(`[API] Request failed: ${errorDetails}`);
          throw new Error(errorDetails);
        }

        logger.debug(`[API] ${response.status} ${url} (${duration}ms)`);

        const text = await response.text();
        if (!text) {
          return null as T;
        }
        try {
          return JSON.parse(text) as T;
        } catch (parseError) {
          if (attempts < maxAttempts - 1) {
            attempts++;
            logger.debug(`JSON parse attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          logger.error('Failed to parse response JSON:', text);
          throw parseError;
        }
      } catch (error) {
        attempts++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (attempts < maxAttempts && (
          errorMessage.includes('Network request failed') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('JSON parse')
        )) {
          logger.debug(`[API] Retry ${attempts}/${maxAttempts} for error: ${errorMessage}`);
          await new Promise(resolve => setTimeout(resolve, 300 * attempts));
          continue;
        }

        if (attempts >= maxAttempts) {
          const duration = Date.now() - startTime;
          logger.error(`[API] Final failure after ${attempts} attempts (${duration}ms):`, error);
        }
        throw error;
      }
    }
    throw new Error('ApiClient: Request failed after maximum retries');
  }

  get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body as BodyInit | Record<string, unknown> | null,
    });
  }

  put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body as BodyInit | Record<string, unknown> | null,
    });
  }

  delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
