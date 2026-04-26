"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./auth.module.css";

// Allowed email domain suffixes
const ALLOWED_DOMAINS = [".edu", ".edu.hk", ".edu.cn", ".hk", ".gov"];

function isAllowedEmail(email) {
  const lower = email.toLowerCase().trim();
  return ALLOWED_DOMAINS.some((d) => lower.endsWith(d));
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate .edu email
    if (!isAllowedEmail(email)) {
      setError("請使用學術或政府電郵註冊（.edu / .edu.hk / .edu.cn / .hk / .gov）");
      return;
    }

    if (password.length < 6) {
      setError("密碼至少需要 6 個字元");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data?.user?.identities?.length === 0) {
      setError("此電郵已被註冊");
    } else {
      setSuccess("註冊成功！請到你的電郵收取驗證信，點擊連結完成驗證。");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      if (authError.message.includes("Invalid login")) {
        setError("電郵或密碼錯誤");
      } else if (authError.message.includes("Email not confirmed")) {
        setError("請先到電郵驗證你的帳號");
      } else {
        setError(authError.message);
      }
    } else {
      router.push("/");
    }
  }

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* Back link */}
      <Link href="/" className={styles.backLink}>
        ← Back to Home
      </Link>

      {/* Auth Card */}
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.cardLogo}>
          <span className={styles.cardLogoIcon}>🚀</span>
          <span className={styles.cardLogoText}>HK UpUp</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
          >
            Login
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.tabActive : ""}`}
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
          >
            Register
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className={styles.alert} data-type="error">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className={styles.alert} data-type="success">
            ✅ {success}
          </div>
        )}

        {/* Register Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Tony"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  id="register-first-name"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Chan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  id="register-last-name"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@university.edu.hk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="register-email"
              />
              <span className={styles.hint}>
                支持 .edu / .edu.hk / .edu.cn / .hk / .gov 電郵
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="至少 6 個字元"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  id="register-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              id="register-submit"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@university.edu.hk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              id="login-submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className={styles.cardFooter}>
          {mode === "login" ? (
            <>還沒有帳號？<button className={styles.switchBtn} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>立即註冊</button></>
          ) : (
            <>已有帳號？<button className={styles.switchBtn} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>登入</button></>
          )}
        </p>
      </div>
    </div>
  );
}
