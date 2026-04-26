"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "../../../admin.module.css";

export default function EditPaper({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
      return;
    }
    loadItem();
  }, []);

  async function loadItem() {
    const { data } = await supabase.from("papers").select("*").eq("id", id).single();
    if (data) {
      setForm({
        full_name: data.full_name || "",
        abbreviation: data.abbreviation || "",
        official_url: data.official_url || "",
        conference_dates: data.conference_dates || "",
        venue: data.venue || "",
        organizer: data.organizer || "",
        registration_deadline: data.registration_deadline || "",
      });
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("papers").update({
      full_name: form.full_name,
      abbreviation: form.abbreviation || null,
      official_url: form.official_url || null,
      conference_dates: form.conference_dates || null,
      venue: form.venue || null,
      organizer: form.organizer || null,
      registration_deadline: form.registration_deadline || null,
    }).eq("id", id);

    setSaving(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/admin/papers");
    }
  }

  if (loading) {
    return <div className={styles.page}><div className={styles.main}><div className={styles.empty}>Loading...</div></div></div>;
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
          <h1 className={styles.pageTitle}>Edit Paper</h1>
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
                <input className={styles.formInput} name="abbreviation" value={form.abbreviation} onChange={handleChange} />
              </div>

              <div>
                <label className={styles.formLabel}>Organizer</label>
                <input className={styles.formInput} name="organizer" value={form.organizer} onChange={handleChange} />
              </div>

              <div>
                <label className={styles.formLabel}>Conference Dates</label>
                <input className={styles.formInput} name="conference_dates" value={form.conference_dates} onChange={handleChange} />
              </div>

              <div>
                <label className={styles.formLabel}>Venue</label>
                <input className={styles.formInput} name="venue" value={form.venue} onChange={handleChange} />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Registration Deadline</label>
                <input className={styles.formInput} name="registration_deadline" value={form.registration_deadline} onChange={handleChange} />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Official URL</label>
                <input className={styles.formInput} name="official_url" type="url" value={form.official_url} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link href="/admin/papers" className={styles.cancelBtn}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
