// src/app/(auth)/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // TODO: Implement actual registration API
    // For now, show a message and redirect to login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // After successful registration, redirect to login
    router.push('/login?registered=true');
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: '/feed' });
  };

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
            Tối thiểu 8 ký tự, bao gồm chữ và số
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

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card/50 text-muted-foreground">hoặc đăng ký với</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          className="h-11 bg-background/50 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleSocialLogin('facebook')}
          disabled={isLoading}
          className="h-11 bg-background/50 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </Button>
      </div>

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