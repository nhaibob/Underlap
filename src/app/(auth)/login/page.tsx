// src/app/(auth)/login/page.tsx
import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="font-headline text-3xl font-bold text-text-primary">
          Đăng nhập
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Tiếp tục thiết kế chiến thuật.
        </p>
      </div>

      <form className="space-y-4">
        {/* Input Email/Username */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email hoặc Tên người dùng</label>
          <Input type="text" placeholder="tactician_07" required />
        </div>

        {/* Input Mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Mật khẩu</label>
          <Input type="password" placeholder="••••••••" required />
          <p className="text-xs text-right mt-1">
            <Link href="#" className="text-text-secondary hover:text-primary">Quên mật khẩu?</Link>
          </p>
        </div>

        {/* Nút Đăng nhập */}
        <Button type="submit" variant="primary" className="w-full mt-6">
          Đăng nhập
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </>
  );
}