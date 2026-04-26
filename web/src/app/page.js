"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

// ---- Helper: format deadline display ----
function formatDeadline(dateStr) {
  if (!dateStr) return "TBC";
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  const formatted = deadline.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return { formatted, diffDays };
}

// ---- Helper: get deadline urgency class ----
function getDeadlineClass(diffDays) {
  if (diffDays < 0) return "";
  if (diffDays <= 7) return styles.deadlineUrgent;
  if (diffDays <= 14) return styles.deadlineSoon;
  return "";
}

// ---- Status badge labels ----
const STATUS_LABELS = {
  open: "Open",
  upcoming: "Upcoming",
  closed: "Closed",
  ended: "Ended",
};

// ---- Skeleton loading card ----
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonPoster} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} ${styles.short}`} />
        <div className={`${styles.skeletonLine} ${styles.long}`} />
        <div className={`${styles.skeletonLine} ${styles.medium}`} />
        <div className={`${styles.skeletonLine} ${styles.short}`} style={{ marginTop: "16px" }} />
      </div>
    </div>
  );
}

// ---- Competition Card ----
function CompetitionCard({ competition, index }) {
  const { formatted, diffDays } = formatDeadline(competition.registration_deadline);
  const deadlineClass = getDeadlineClass(diffDays);
  const statusClass = styles[`status${competition.status?.charAt(0).toUpperCase()}${competition.status?.slice(1)}`] || "";

  // Deadline display text
  let deadlineText;
  if (diffDays < 0) {
    deadlineText = "Expired";
  } else if (diffDays === 0) {
    deadlineText = "Today!";
  } else if (diffDays <= 7) {
    deadlineText = `${diffDays}d left`;
  } else {
    deadlineText = formatted;
  }

  return (
    <Link
      href={`/competition/${competition.id}`}
      className={`${styles.compCard} ${competition.status === "closed" ? styles.compCardClosed : ""} animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
      id={`competition-${competition.id}`}
    >
      {/* Poster */}
      <div className={styles.compCardPoster}>
        {competition.poster_url ? (
          <img
            src={competition.poster_url}
            alt={`${competition.title} poster`}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            background: "linear-gradient(135deg, #EDE9FE, #F0F9FF)",
          }}>
            🏆
          </div>
        )}
        <div className={styles.compCardPosterOverlay} />

        {/* Status Badge */}
        <div className={`${styles.statusBadge} ${statusClass}`}>
          <span className={styles.statusBadgeDot} />
          {STATUS_LABELS[competition.status] || competition.status}
        </div>
      </div>

      {/* Body */}
      <div className={styles.compCardBody}>
        <div className={styles.compCardLeft}>
          <div className={styles.compCardOrganizer}>
            <span>🏛️</span>
            {competition.organizer?.length > 50
              ? competition.organizer.substring(0, 50) + "..."
              : competition.organizer}
          </div>

          <h3 className={styles.compCardTitle}>{competition.title}</h3>

          {/* Tags */}
          {competition.tags && competition.tags.length > 0 && (
            <div className={styles.compCardTags}>
              {competition.tags.map((tag) => (
                <span key={tag} className={styles.compTag}>{tag}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className={styles.compCardMeta}>
            <div className={styles.compCardMetaItem}>
              <span className={styles.compCardMetaIcon}>🎁</span>
              <span>{competition.prizes || "TBC"}</span>
            </div>
          </div>
        </div>

        <div className={styles.compCardRight}>
          <div className={`${styles.compCardDeadline} ${deadlineClass}`}>
            📅 Deadline
            <strong>{deadlineText}</strong>
          </div>
          <div className={styles.compCardArrow}>View →</div>
        </div>
      </div>
    </Link>
  );
}

// ---- Main Page ----
export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showClosed, setShowClosed] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [authUser, setAuthUser] = useState(undefined);
  const dropdownRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthUser(data?.user || null));
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchCompetitions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .order("registration_deadline", { ascending: true });

    if (error) {
      console.error("Error fetching competitions:", error);
    } else {
      setCompetitions(data || []);
      const tags = new Set();
      (data || []).forEach((c) => {
        (c.tags || []).forEach((t) => tags.add(t));
      });
      setAllTags(Array.from(tags));
    }
    setLoading(false);
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // Filter
  const tagFiltered =
    selectedTags.length === 0
      ? competitions
      : competitions.filter((c) =>
          (c.tags || []).some((t) => selectedTags.includes(t))
        );

  const closedCount = tagFiltered.filter((c) => c.status === "closed").length;
  const openComps = tagFiltered.filter((c) => c.status !== "closed");
  const closedComps = tagFiltered.filter((c) => c.status === "closed");
  const filteredCompetitions = showClosed
    ? [...openComps, ...closedComps]
    : openComps;

  // Button label
  const categoryLabel =
    selectedTags.length === 0
      ? "All Categories"
      : selectedTags.length <= 2
        ? selectedTags.join(", ")
        : `${selectedTags.length} selected`;

  return (
    <>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚀</span>
            <span className={styles.logoGradient}>HK UpUp</span>
            <span className={styles.logoTagline}>香港一站式比賽資訊平台</span>
          </div>
          <div className={styles.navLinks}>
            <span className={`${styles.navLink} ${styles.navLinkActive}`}>Competition</span>
            <Link href="/paper" className={styles.navLink}>Paper</Link>
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

      {/* Competitions Section */}
      <section className={styles.section} id="competitions">
        <div className={styles.sectionHeader}>
          {/* Category Dropdown */}
          <div className={styles.categoryDropdown} ref={dropdownRef}>
            <button
              className={`${styles.categoryBtn} ${categoryOpen ? styles.categoryBtnOpen : ""}`}
              onClick={() => setCategoryOpen(!categoryOpen)}
              id="category-toggle"
            >
              <span className={styles.categoryLabel}>{categoryLabel}</span>
              <span className={`${styles.categoryArrow} ${categoryOpen ? styles.categoryArrowOpen : ""}`}>▾</span>
            </button>

            {categoryOpen && (
              <div className={styles.categoryMenu}>
                <button
                  className={`${styles.categoryItem} ${selectedTags.length === 0 ? styles.categoryItemActive : ""}`}
                  onClick={() => { setSelectedTags([]); setCategoryOpen(false); }}
                  id="category-all"
                >
                  <span className={styles.categoryCheckbox}>
                    {selectedTags.length === 0 && <span className={styles.categoryCheckmark} />}
                  </span>
                  All Categories
                </button>
                <div className={styles.categoryDivider} />
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`${styles.categoryItem} ${selectedTags.includes(tag) ? styles.categoryItemActive : ""}`}
                    onClick={() => toggleTag(tag)}
                    id={`category-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span className={styles.categoryCheckbox}>
                      {selectedTags.includes(tag) && <span className={styles.categoryCheckmark} />}
                    </span>
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Cards Grid */}
        {!loading && filteredCompetitions.length > 0 && (
          <div className={styles.competitionsGrid}>
            {filteredCompetitions.map((comp, i) => (
              <CompetitionCard key={comp.id} competition={comp} index={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCompetitions.length === 0 && closedCount === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <p className={styles.emptyStateText}>No competitions found for this filter</p>
          </div>
        )}

        {/* Show Closed Toggle */}
        {!loading && closedCount > 0 && (
          <div className={styles.showClosedWrapper}>
            <button
              className={styles.showClosedBtn}
              onClick={() => setShowClosed(!showClosed)}
              id="toggle-closed"
            >
              {showClosed
                ? "Hide expired competitions"
                : `Show ${closedCount} expired competition${closedCount > 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
