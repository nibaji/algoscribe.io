import { apiClient } from './api/client';
import { tokenStore } from './auth/tokenStore';

export interface LoginResponse {
  status: boolean;
  data: {
    token: string;
    refreshToken: string;
  };
  message: string;
}

export async function login(userName: string, password: string): Promise<LoginResponse> {
  const data = await apiClient.post<LoginResponse>('/auth/signin', { userName, password });

  if (data.status && data.data?.token) {
    await tokenStore.setTokens(data.data.token, data.data.refreshToken);
  } else {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

export async function fetchUserAccess() {
  return await apiClient.get('/user/find-all-access');
}

export async function logout() {
  await tokenStore.clearTokens();
}
