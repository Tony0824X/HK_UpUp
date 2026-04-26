"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./detail.module.css";

export default function CompetitionDetail() {
  const params = useParams();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error:", error);
      } else {
        setComp(data);
      }
      setLoading(false);
    }
    if (params.id) fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!comp) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Competition not found.</p>
        <Link href="/" className={styles.backLink}>← Back to all</Link>
      </div>
    );
  }

  // Format deadline
  const deadline = comp.registration_deadline
    ? new Date(comp.registration_deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBC";

  const isExpired =
    comp.registration_deadline &&
    new Date(comp.registration_deadline) < new Date();

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <nav className={styles.topBar}>
        <Link href="/" className={styles.backBtn}>
          ← Back
        </Link>
      </nav>

      {/* Poster */}
      {comp.poster_url && (
        <div className={styles.posterWrapper}>
          <img
            src={comp.poster_url}
            alt={`${comp.title} poster`}
            className={styles.poster}
          />
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {/* Status */}
        <div className={`${styles.statusBadge} ${isExpired ? styles.statusClosed : styles.statusOpen}`}>
          <span className={styles.statusDot} />
          {isExpired ? "Closed" : "Open"}
        </div>

        <h1 className={styles.title}>{comp.title}</h1>

        <div className={styles.organizer}>
          <span>🏛️</span> {comp.organizer}
        </div>

        {/* Tags */}
        {comp.tags && comp.tags.length > 0 && (
          <div className={styles.tags}>
            {comp.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>📅 Registration Deadline</div>
            <div className={`${styles.infoValue} ${isExpired ? styles.expired : ""}`}>
              {deadline}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>🎁 Prizes</div>
            <div className={styles.infoValue}>
              {comp.prizes || "TBC"}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>📌 Status</div>
            <div className={styles.infoValue}>
              {isExpired ? "Registration Closed" : "Open for Registration"}
            </div>
          </div>
        </div>

        {/* CTA */}
        <a
          href={comp.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          Visit Official Website →
        </a>
      </div>
    </div>
  );
}
