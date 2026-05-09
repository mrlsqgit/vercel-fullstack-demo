// lib/types.ts
// Type definitions for User Management

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}