import { apiClient } from './client';
import { AuthResponse, Role } from '../types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export const authApi = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', params);
    return response.data;
  },

  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', params);
    return response.data;
  },
};
