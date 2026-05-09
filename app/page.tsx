// app/page.tsx
// Main page: User list with CRUD operations and Excel import/export

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, ApiResponse } from '@/lib/types';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [importModal, setImportModal] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; details?: string[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data: ApiResponse<User[]> = await res.json();
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user: User) {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data: ApiResponse = await res.json();
      
      if (data.success) {
        setUsers(users.filter(u => u.id !== user.id));
        setDeleteModal({ show: false, user: null });
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/users');
      const data: ApiResponse<User[]> = await res.json();
      
      if (data.success && data.data) {
        const worksheetData = data.data.map((user) => ({
          ID: user.id,
          姓名: user.name,
          邮箱: user.email,
          电话: user.phone || '',
          状态: user.status === 'active' ? '正常' : '禁用',
          创建时间: new Date(user.created_at).toLocaleString('zh-CN'),
          更新时间: new Date(user.updated_at).toLocaleString('zh-CN'),
        }));

        const csvContent = [
          ['ID', '姓名', '邮箱', '电话', '状态', '创建时间', '更新时间'].join(','),
          ...worksheetData.map(row => [
            row.ID,
            `"${row.姓名}"`,
            `"${row.邮箱}"`,
            `"${row.电话}"`,
            `"${row.状态}"`,
            `"${row.创建时间}"`,
            `"${row.更新时间}"`,
          ].join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert('导出失败: ' + err.message);
    }
  }

  async function handleDownloadTemplate() {
    const templateData = [
      ['姓名', '邮箱', '电话', '状态'],
      ['张三', 'zhangsan@example.com', '13800138001', '正常'],
      ['李四', 'lisi@example.com', '13800138002', '正常'],
      ['王五', 'wangwu@example.com', '', '禁用'],
    ];

    const csvContent = templateData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/users/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        const { imported, failed, errors } = data.data;
        let message = `成功导入 ${imported} 个用户`;
        if (failed > 0) {
          message += `，失败 ${failed} 个`;
        }
        setImportResult({
          success: true,
          message,
          details: errors && errors.length > 0 ? errors : undefined,
        });
        fetchUsers();
      } else {
        setImportResult({
          success: false,
          message: data.error || '导入失败',
        });
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        message: '导入失败: ' + err.message,
      });
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">用户列表</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setImportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            导入用户
          </button>
          <button
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            导出用户
          </button>
          <Link
            href="/users/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            新增用户
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          暂无用户数据
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status === 'active' ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ show: true, user })}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteModal.show && deleteModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除用户 <strong>{deleteModal.user.name}</strong> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteModal.user!)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {importModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">导入用户</h3>
              <button
                onClick={() => {
                  setImportModal(false);
                  setImportResult(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                请上传包含用户信息的 Excel 文件 (.xlsx, .xls) 或 CSV 文件。
              </p>
              
              <button
                onClick={handleDownloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                下载导入模板
              </button>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {importLoading ? (
                  <div className="text-blue-600">导入中...</div>
                ) : (
                  <div>
                    <div className="text-gray-500 mb-2">点击或拖拽文件到此处上传</div>
                    <div className="text-gray-400 text-sm">支持 .xlsx, .xls, .csv 格式</div>
                  </div>
                )}
              </div>

              {importResult && (
                <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="font-medium">{importResult.message}</p>
                  {importResult.details && importResult.details.length > 0 && (
                    <div className="mt-2 text-sm space-y-1">
                      <p className="font-medium">失败详情:</p>
                      {importResult.details.map((detail, index) => (
                        <p key={index}>{detail}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}