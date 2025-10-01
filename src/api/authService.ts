import apiClient from './apiClient';
import { AuthLoginDtoInput, UserCreateDtoInput } from './types';

export const login = async (credentials: AuthLoginDtoInput) => {
  const response = await apiClient.post('/Auth/Login', credentials);
  return response.data;
};

export const register = async (userInfo: UserCreateDtoInput) => {
  const response = await apiClient.post('/User/Create', userInfo);
  return response.data;
};
