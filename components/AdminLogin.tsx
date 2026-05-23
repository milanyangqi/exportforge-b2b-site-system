"use client";

import { useState } from "react";
import type { LocaleCode } from "@/types/site";

export function AdminLogin({ locale }: { locale: LocaleCode }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });
    setLoading(false);
    if (!response.ok) {
      setError(response.status === 401
        ? "账号或密码不正确。默认账号 admin@example.com，默认密码 change-me。"
        : `登录接口异常（HTTP ${response.status}），请刷新页面或重启开发服务。`
      );
      return;
    }
    window.location.href = `/${locale}/admin`;
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="eyebrow">Secure admin</span>
        <h1>登录后台</h1>
        <p>使用环境变量 `INITIAL_ADMIN_EMAIL` 和 `INITIAL_ADMIN_PASSWORD` 配置真实管理员账号。</p>
        <label>
          邮箱
          <input name="email" type="email" defaultValue="admin@example.com" required />
        </label>
        <label>
          密码
          <input name="password" type="password" defaultValue="change-me" required />
        </label>
        <button type="submit" disabled={loading}>{loading ? "登录中..." : "登录"}</button>
        {error ? <p className="login-error">{error}</p> : null}
      </form>
    </main>
  );
}
