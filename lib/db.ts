// lib/db.ts
// Database connection and query functions for Vercel Postgres

import { sql } from '@vercel/postgres';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  status?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export async function query(text: string, params?: any[]) {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getUsers(): Promise<User[]> {
  const result = await query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows as User[];
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] as User | null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { name, email, phone, status = 'active' } = input;
  const result = await query(
    'INSERT INTO users (name, email, phone, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, phone, status]
  );
  return result.rows[0] as User;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(input.email);
  }
  if (input.phone !== undefined) {
    fields.push(`phone = $${paramIndex++}`);
    values.push(input.phone);
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] as User | null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}