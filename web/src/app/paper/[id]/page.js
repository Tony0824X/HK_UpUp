"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./detail.module.css";

export default function PaperDetail() {
  const params = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaper() {
      const { data, error } = await supabase
        .from("papers")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error:", error);
      } else {
        setPaper(data);
      }
      setLoading(false);
    }
    if (params.id) fetchPaper();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Paper not found.</p>
        <Link href="/paper" className={styles.backLink}>← Back to Papers</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <nav className={styles.topBar}>
        <Link href="/paper" className={styles.backBtn}>
          ← Back to Papers
        </Link>
      </nav>

      {/* Content */}
      <div className={styles.content}>
        {/* Badge */}
        {paper.abbreviation && (
          <div className={styles.badge}>{paper.abbreviation}</div>
        )}

        <h1 className={styles.title}>{paper.full_name}</h1>

        {paper.organizer && (
          <div className={styles.organizer}>
            <span>🏛️</span> {paper.organizer}
          </div>
        )}

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          {paper.conference_dates && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>📅 Conference Dates</div>
              <div className={styles.infoValue}>{paper.conference_dates}</div>
            </div>
          )}

          {paper.venue && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>📍 Venue</div>
              <div className={styles.infoValue}>{paper.venue}</div>
            </div>
          )}

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>⏰ Registration Deadline</div>
            <div className={styles.infoValue}>
              {paper.registration_deadline || "TBC"}
            </div>
          </div>

          {paper.indexing && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>🔍 檢索收錄 (Indexing)</div>
              <div className={styles.infoValue}>{paper.indexing}</div>
            </div>
          )}
        </div>

        {/* Call for Topics */}
        {paper.call_for_topics && (
          <div className={styles.detailSection}>
            <h2 className={styles.sectionTitle}>📝 徵稿主題 (Call for Topics)</h2>
            <div className={styles.detailContent}>
              {paper.call_for_topics.split("\n").map((line, i) => (
                <p key={i}>{line || "\u00A0"}</p>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {paper.official_url && (
          <a
            href={paper.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Visit Official Website →
          </a>
        )}
      </div>
    </div>
  );
}
