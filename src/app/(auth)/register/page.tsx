// src/app/(auth)/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, UserPlus, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate password length
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }

    try {
      await supabaseAuth.signUp(formData.email, formData.password, formData.username);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi đăng ký');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Đăng ký thành công!</h2>
        <p className="text-muted-foreground">
          Đang chuyển hướng đến trang đăng nhập...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary mb-4 shadow-lg shadow-secondary/25">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Tạo tài khoản
        </h1>
        <p className="text-muted-foreground mt-2">
          Bắt đầu thiết kế chiến thuật ngay hôm nay
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="email" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="pl-11 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
              required 
            />
          </div>
        </div>

        {/* Username Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Tên người dùng
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="tactician_07"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="pl-11 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
              required 
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="pl-11 pr-11 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
              required 
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tối thiểu 6 ký tự
          </p>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <input 
            type="checkbox" 
            id="terms" 
            required
            className="w-4 h-4 mt-0.5 rounded border-white/20 bg-background/50 text-primary focus:ring-primary focus:ring-offset-0"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
            Tôi đồng ý với{' '}
            <Link href="#" className="text-primary hover:underline">Điều khoản sử dụng</Link>
            {' '}và{' '}
            <Link href="#" className="text-primary hover:underline">Chính sách bảo mật</Link>
          </label>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-lg shadow-secondary/25 transition-all duration-300 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              Tạo tài khoản
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Đã có tài khoản?{' '}
        <Link 
          href="/login" 
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </>
  );
}