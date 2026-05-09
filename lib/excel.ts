// lib/excel.ts
// Excel import/export utilities using xlsx library

import * as XLSX from 'xlsx';
import { User, CreateUserInput } from './types';

export interface ExcelUser {
  name: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive';
}

export function usersToExcel(users: User[]): string {
  const worksheetData = users.map((user) => ({
    ID: user.id,
    姓名: user.name,
    邮箱: user.email,
    电话: user.phone || '',
    状态: user.status === 'active' ? '正常' : '禁用',
    创建时间: new Date(user.created_at).toLocaleString('zh-CN'),
    更新时间: new Date(user.updated_at).toLocaleString('zh-CN'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '用户列表');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
}

export function excelToUsers(fileBuffer: Buffer): CreateUserInput[] {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  return jsonData.map((row: any) => {
    const name = String(row['姓名'] || row['name'] || '');
    const email = String(row['邮箱'] || row['email'] || '');
    const phone = String(row['电话'] || row['phone'] || '');
    const statusStr = (row['状态'] as string) || row['status'];
    
    const result: CreateUserInput = { name, email };
    if (phone) result.phone = phone;
    if (statusStr) {
      result.status = (statusStr === '禁用' ? 'inactive' : 'active') as 'active' | 'inactive';
    }
    
    return result;
  }).filter((user) => user.name && user.email);
}

export function generateTemplate(): string {
  const templateData = [
    { 姓名: '张三', 邮箱: 'zhangsan@example.com', 电话: '13800138001', 状态: '正常' },
    { 姓名: '李四', 邮箱: 'lisi@example.com', 电话: '13800138002', 状态: '正常' },
    { 姓名: '王五', 邮箱: 'wangwu@example.com', 电话: '', 状态: '禁用' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
}