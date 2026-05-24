// src/app/(auth)/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Chrome,
  Github,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/feed";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email, username hoặc mật khẩu không đúng");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError(`Không thể đăng nhập bằng ${provider}. Vui lòng thử lại.`);
      setOauthLoading(null);
    }
  };

  const hasGoogleOAuth = process.env.NEXT_PUBLIC_HAS_GOOGLE_OAUTH === "true";
  const hasGithubOAuth = process.env.NEXT_PUBLIC_HAS_GITHUB_OAUTH === "true";

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/25">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Chào mừng trở lại
        </h1>
        <p className="text-muted-foreground mt-2">
          Đăng nhập để tiếp tục thiết kế chiến thuật
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* OAuth Buttons */}
      {(hasGoogleOAuth || hasGithubOAuth) && (
        <div className="space-y-3 mb-6">
          {hasGoogleOAuth && (
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-foreground transition-all disabled:opacity-50"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 text-red-400" />
              )}
              Tiếp tục với Google
            </button>
          )}
          {hasGithubOAuth && (
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-foreground transition-all disabled:opacity-50"
            >
              {oauthLoading === "github" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              Tiếp tục với GitHub
            </button>
          )}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-3">hoặc đăng nhập bằng email</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email/Username Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Tên người dùng hoặc Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="username hoặc you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="pl-11 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="pl-11 pr-11 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Đăng ký ngay
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}