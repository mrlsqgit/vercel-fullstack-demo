// app/api/users/import/route.ts
// API Route: Import users from Excel file

import { NextRequest, NextResponse } from 'next/server';
import { excelToUsers } from '@/lib/excel';
import { createUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要导入的文件' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const users = excelToUsers(fileBuffer);

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel 文件中没有有效的用户数据' },
        { status: 400 }
      );
    }

    const results = [];
    const errors: string[] = [];

    for (const user of users) {
      try {
        const createdUser = await createUser(user);
        results.push(createdUser);
      } catch (error: any) {
        errors.push(`${user.name} (${user.email}): ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: results.length,
        failed: errors.length,
        errors,
      },
    });
  } catch (error: any) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { success: false, error: error.message || '导入失败' },
      { status: 500 }
    );
  }
}