"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./profile.module.css";

const SCHOOLS = [
  "HKU - The University of Hong Kong",
  "CUHK - The Chinese University of Hong Kong",
  "HKUST - Hong Kong University of Science and Technology",
  "CityU - City University of Hong Kong",
  "PolyU - The Hong Kong Polytechnic University",
  "HKBU - Hong Kong Baptist University",
  "EdUHK - The Education University of Hong Kong",
  "LU - Lingnan University",
  "Other",
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubToken, setGithubToken] = useState("");

  // GitHub repos
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    async function init() {
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/auth");
        return;
      }
      setUser(authUser);

      // Fetch profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFirstName(prof.first_name || "");
        setLastName(prof.last_name || "");
        setSchool(prof.school || "");
        setFaculty(prof.faculty || "");
        setMajor(prof.major || "");
        setGithubUsername(prof.github_username || "");
        setGithubToken(prof.github_token || "");
      }
      setLoading(false);
    }
    init();
  }, [router]);

  // Handle GitHub callback params
  useEffect(() => {
    const ghConnected = searchParams.get("github_connected");
    const ghUser = searchParams.get("github_username");
    const ghToken = searchParams.get("github_token");

    if (ghConnected && ghUser && ghToken) {
      setGithubUsername(ghUser);
      setGithubToken(ghToken);
      // Auto-save GitHub info
      if (user) {
        supabase
          .from("profiles")
          .update({ github_username: ghUser, github_token: ghToken })
          .eq("id", user.id)
          .then(() => {
            setMessage("GitHub 連接成功！");
            // Clean URL
            window.history.replaceState({}, "", "/profile");
          });
      }
    }
  }, [searchParams, user]);

  // Fetch GitHub repos
  useEffect(() => {
    if (githubToken && githubUsername) {
      fetchRepos();
    }
  }, [githubToken, githubUsername]);

  async function fetchRepos() {
    setLoadingRepos(true);
    try {
      const resp = await fetch("https://api.github.com/user/repos?sort=updated&per_page=20", {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setRepos(data);
      }
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    }
    setLoadingRepos(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        school,
        faculty,
        major,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage("儲存失敗：" + error.message);
    } else {
      setMessage("已儲存 ✅");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function connectGitHub() {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/github/callback`;
    const scope = "read:user,repo";
    const state = user.id;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  function disconnectGitHub() {
    setGithubUsername("");
    setGithubToken("");
    setRepos([]);
    supabase
      .from("profiles")
      .update({ github_username: null, github_token: null })
      .eq("id", user.id);
    setMessage("GitHub 已斷開連接");
  }

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🚀</span>
            <span className={styles.logoGradient}>HK UpUp</span>
          </Link>
          <div className={styles.navRight}>
            <Link href="/" className={styles.navLink}>Competition</Link>
            <Link href="/paper" className={styles.navLink}>Paper</Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Avatar + Name */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <h1 className={styles.profileName}>{firstName} {lastName}</h1>
            <p className={styles.profileEmail}>{user?.email}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={styles.message}>{message}</div>
        )}

        {/* Profile Form */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal Info</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input
                type="text"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={`${styles.input} ${styles.inputDisabled}`}
                value={user?.email || ""}
                disabled
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>School</label>
              <select
                className={styles.input}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              >
                <option value="">Select your school</option>
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Faculty</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Faculty of Engineering"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Major</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Computer Science"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
          </div>
          <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </section>

        {/* GitHub Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>GitHub</h2>

          {githubUsername ? (
            <>
              <div className={styles.githubConnected}>
                <div className={styles.githubInfo}>
                  <img
                    src={`https://github.com/${githubUsername}.png?size=40`}
                    alt={githubUsername}
                    className={styles.githubAvatar}
                  />
                  <div>
                    <div className={styles.githubName}>@{githubUsername}</div>
                    <div className={styles.githubStatus}>✅ Connected</div>
                  </div>
                </div>
                <button onClick={disconnectGitHub} className={styles.disconnectBtn}>
                  Disconnect
                </button>
              </div>

              {/* Repos */}
              <div className={styles.repoList}>
                <h3 className={styles.repoTitle}>Your Repositories</h3>
                {loadingRepos && <div className={styles.spinner} />}
                {repos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.repoCard}
                  >
                    <div className={styles.repoInfo}>
                      <div className={styles.repoName}>{repo.name}</div>
                      {repo.description && (
                        <div className={styles.repoDesc}>{repo.description}</div>
                      )}
                    </div>
                    <div className={styles.repoMeta}>
                      {repo.language && (
                        <span className={styles.repoLang}>
                          <span className={styles.langDot} data-lang={repo.language} />
                          {repo.language}
                        </span>
                      )}
                      <span className={styles.repoStars}>⭐ {repo.stargazers_count}</span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.githubPrompt}>
              <p>連接你的 GitHub 帳號，展示你的項目和代碼</p>
              <button onClick={connectGitHub} className={styles.githubBtn}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={styles.githubIcon}>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Connect GitHub
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div className="spinner" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
