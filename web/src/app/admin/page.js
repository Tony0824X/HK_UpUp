"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";

// Admin credentials
const ADMIN_USER = "hkupupadmin426";
const ADMIN_PASS = "hkupupadmin426.";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [compCount, setCompCount] = useState(0);
  const [paperCount, setPaperCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true") {
      setAuthed(true);
      loadCounts();
    }
  }, []);

  async function loadCounts() {
    const { count: c1 } = await supabase.from("competitions").select("*", { count: "exact", head: true });
    const { count: c2 } = await supabase.from("papers").select("*", { count: "exact", head: true });
    setCompCount(c1 || 0);
    setPaperCount(c2 || 0);
  }

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "true");
      setAuthed(true);
      loadCounts();
    } else {
      setError("Invalid username or password");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    setAuthed(false);
    setUsername("");
    setPassword("");
  }

  // Login screen
  if (!authed) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>🔒 Admin Panel</h1>
          <p className={styles.loginSub}>HK UpUp Management</p>

          {error && <div className={styles.loginError}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className={styles.loginField}>
              <label className={styles.loginLabel}>Username</label>
              <input
                className={styles.loginInput}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                id="admin-username"
              />
            </div>
            <div className={styles.loginField}>
              <label className={styles.loginLabel}>Password</label>
              <input
                type="password"
                className={styles.loginInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="admin-password"
              />
            </div>
            <button type="submit" className={styles.loginBtn} id="admin-login">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link href="/admin" className={styles.topBarLogo}>
            <img src="/logo.png" alt="HK UpUp" />
            HK UpUp
          </Link>
          <span className={styles.topBarBadge}>ADMIN</span>
        </div>
        <div className={styles.topBarNav}>
          <Link href="/admin" className={`${styles.topBarLink} ${styles.topBarLinkActive}`}>Dashboard</Link>
          <Link href="/admin/competitions" className={styles.topBarLink}>Competitions</Link>
          <Link href="/admin/papers" className={styles.topBarLink}>Papers</Link>
          <Link href="/" className={styles.topBarLink}>View Site →</Link>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>

        <div className={styles.statsGrid}>
          <Link href="/admin/competitions" className={styles.statCard}>
            <div className={styles.statLabel}>🏆 Competitions</div>
            <div className={styles.statValue}>{compCount}</div>
          </Link>
          <Link href="/admin/papers" className={styles.statCard}>
            <div className={styles.statLabel}>📄 Papers</div>
            <div className={styles.statValue}>{paperCount}</div>
          </Link>
          <Link href="/" className={styles.statCard}>
            <div className={styles.statLabel}>🌐 Live Site</div>
            <div className={styles.statValue}>→</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
