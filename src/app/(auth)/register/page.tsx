// src/app/(auth)/register/page.tsx
import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="font-headline text-3xl font-bold text-text-primary">
          Đăng ký tài khoản
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Bắt đầu thiết kế chiến thuật ngay hôm nay.
        </p>
      </div>

      <form className="space-y-4">
        {/* Input Email */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <Input type="email" placeholder="email@example.com" required />
        </div>
        
        {/* Input Username */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Tên người dùng</label>
          <Input type="text" placeholder="tactician_07" required />
        </div>

        {/* Input Mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Mật khẩu</label>
          <Input type="password" placeholder="••••••••" required />
        </div>

        {/* Nút Đăng ký */}
        <Button type="submit" variant="default" className="w-full mt-6">
          Tạo tài khoản Underlap
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </>
  );
}