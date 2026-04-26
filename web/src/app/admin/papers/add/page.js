"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { s2t } from "@/lib/s2t";
import styles from "../../admin.module.css";

export default function AddPaper() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    abbreviation: "",
    official_url: "",
    conference_dates: "",
    venue: "",
    organizer: "",
    registration_deadline: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "true") {
      router.replace("/admin");
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("papers").insert({
      full_name: s2t(form.full_name),
      abbreviation: s2t(form.abbreviation) || null,
      official_url: form.official_url || null,
      conference_dates: s2t(form.conference_dates) || null,
      venue: s2t(form.venue) || null,
      organizer: s2t(form.organizer) || null,
      registration_deadline: s2t(form.registration_deadline) || null,
    });

    setSaving(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/admin/papers");
    }
  }

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
          <Link href="/admin" className={styles.topBarLink}>Dashboard</Link>
          <Link href="/admin/competitions" className={styles.topBarLink}>Competitions</Link>
          <Link href="/admin/papers" className={`${styles.topBarLink} ${styles.topBarLinkActive}`}>Papers</Link>
        </div>
        <button className={styles.logoutBtn} onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); }}>Logout</button>
      </div>

      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Add Paper</h1>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Full Name *</label>
                <input className={styles.formInput} name="full_name" value={form.full_name} onChange={handleChange} required />
              </div>

              <div>
                <label className={styles.formLabel}>Abbreviation</label>
                <input className={styles.formInput} name="abbreviation" value={form.abbreviation} onChange={handleChange} placeholder="e.g. CVPR 2026" />
              </div>

              <div>
                <label className={styles.formLabel}>Organizer</label>
                <input className={styles.formInput} name="organizer" value={form.organizer} onChange={handleChange} />
              </div>

              <div>
                <label className={styles.formLabel}>Conference Dates</label>
                <input className={styles.formInput} name="conference_dates" value={form.conference_dates} onChange={handleChange} placeholder="e.g. 15-20 Jun 2026" />
              </div>

              <div>
                <label className={styles.formLabel}>Venue</label>
                <input className={styles.formInput} name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Hong Kong" />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Registration Deadline</label>
                <input className={styles.formInput} name="registration_deadline" value={form.registration_deadline} onChange={handleChange} placeholder="e.g. 15 May 2026" />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Official URL</label>
                <input className={styles.formInput} name="official_url" type="url" value={form.official_url} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Paper"}
              </button>
              <Link href="/admin/papers" className={styles.cancelBtn}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
