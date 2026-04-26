"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./paper.module.css";

export default function PaperPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [authUser, setAuthUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthUser(data?.user || null));
  }, []);

  useEffect(() => {
    async function fetchPapers() {
      const { data, error } = await supabase
        .from("papers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching papers:", error);
      } else {
        setPapers(data || []);
      }
      setLoading(false);
    }
    fetchPapers();
  }, []);

  // Filter by search
  const filtered = search.trim()
    ? papers.filter(
        (p) =>
          (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.abbreviation || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.venue || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.organizer || "").toLowerCase().includes(search.toLowerCase())
      )
    : papers;

  return (
    <>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link href="/" className={styles.logo}>
            <img src="/logo.svg" alt="HK UpUp" className={styles.logoIcon} />
            <span className={styles.logoGradient}>HK UpUp</span>
            <span className={styles.logoTagline}>香港一站式比賽資訊平台</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Competition</Link>
            <Link href="/paper" className={`${styles.navLink} ${styles.navLinkActive}`}>Paper</Link>
            {authUser === undefined ? (
              <div style={{ width: 36, height: 36 }} />
            ) : authUser ? (
              <Link href="/profile" className={styles.navAvatar} id="nav-profile">
                {(authUser.user_metadata?.first_name?.[0] || "").toUpperCase()}{(authUser.user_metadata?.last_name?.[0] || "").toUpperCase()}
              </Link>
            ) : (
              <Link href="/auth" className={styles.navCta} id="nav-get-started">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜尋全球學術會議徵稿資訊，把握投稿機會..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="paper-search"
          />
          {search && (
            <button
              className={styles.searchClear}
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results count */}
        <div className={styles.resultCount}>
          {filtered.length} 個會議
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner} />
          </div>
        )}

        {/* Paper List */}
        {!loading && (
          <div className={styles.paperList}>
            {filtered.map((paper, index) => (
              <Link
                key={paper.id}
                href={`/paper/${paper.id}`}
                className={`${styles.paperCard} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
                id={`paper-${paper.id}`}
              >
                {/* Abbreviation badge */}
                {paper.abbreviation && (
                  <div className={styles.paperBadge}>
                    {paper.abbreviation}
                  </div>
                )}

                {/* Info */}
                <div className={styles.paperInfo}>
                  <h3 className={styles.paperTitle}>{paper.full_name}</h3>
                  <div className={styles.paperMeta}>
                    {paper.conference_dates && (
                      <span className={styles.paperMetaItem}>
                        <span className={styles.metaIcon}>📅</span>
                        {paper.conference_dates}
                      </span>
                    )}
                    {paper.venue && (
                      <span className={styles.paperMetaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        {paper.venue}
                      </span>
                    )}
                    {paper.organizer && (
                      <span className={styles.paperMetaItem}>
                        <span className={styles.metaIcon}>🏛️</span>
                        {paper.organizer}
                      </span>
                    )}
                  </div>
                </div>

                {/* Deadline */}
                <div className={styles.paperDeadline}>
                  <div className={styles.deadlineLabel}>Deadline</div>
                  <div className={styles.deadlineValue}>
                    {paper.registration_deadline || "TBC"}
                  </div>
                </div>

                {/* Arrow */}
                <div className={styles.paperArrow}>→</div>
              </Link>
            ))}

            {filtered.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <p>沒有找到相關會議</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
