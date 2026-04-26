"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { s2t } from "@/lib/s2t";
import styles from "../../../admin.module.css";

export default function EditCompetition({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    organizer: "",
    registration_deadline: "",
    tags: "",
    prizes: "",
    official_url: "",
    status: "open",
    hidden: false,
    poster_url: "",
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "true") {
      router.replace("/admin");
      return;
    }
    loadItem();
  }, []);

  async function loadItem() {
    const { data } = await supabase.from("competitions").select("*").eq("id", id).single();
    if (data) {
      setForm({
        title: data.title || "",
        organizer: data.organizer || "",
        registration_deadline: data.registration_deadline || "",
        tags: (data.tags || []).join(", "),
        prizes: data.prizes || "",
        official_url: data.official_url || "",
        status: data.status || "open",
        hidden: data.hidden || false,
        poster_url: data.poster_url || "",
      });
      setPosterPreview(data.poster_url || "");
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePoster(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    let poster_url = form.poster_url;

    // Upload new poster if selected
    if (posterFile) {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 60) + ".png";
      const { error: uploadErr } = await supabase.storage
        .from("posters")
        .upload(slug, posterFile, { upsert: true, contentType: posterFile.type });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("posters").getPublicUrl(slug);
        poster_url = urlData.publicUrl;
      }
    }

    const tags = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from("competitions").update({
      title: s2t(form.title),
      organizer: s2t(form.organizer),
      registration_deadline: form.registration_deadline || null,
      tags,
      prizes: s2t(form.prizes) || "TBC",
      official_url: form.official_url || "",
      poster_url,
      status: form.status,
      hidden: form.hidden,
    }).eq("id", id);

    setSaving(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/admin/competitions");
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
          <Link href="/admin/competitions" className={`${styles.topBarLink} ${styles.topBarLinkActive}`}>Competitions</Link>
          <Link href="/admin/papers" className={styles.topBarLink}>Papers</Link>
        </div>
        <button className={styles.logoutBtn} onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); }}>Logout</button>
      </div>

      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Edit Competition</h1>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Title *</label>
                <input className={styles.formInput} name="title" value={form.title} onChange={handleChange} required />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Organizer</label>
                <input className={styles.formInput} name="organizer" value={form.organizer} onChange={handleChange} />
              </div>

              <div>
                <label className={styles.formLabel}>Registration Deadline</label>
                <input className={styles.formInput} name="registration_deadline" type="date" value={form.registration_deadline} onChange={handleChange} />
              </div>

              <div>
                <label className={styles.formLabel}>Status</label>
                <select className={styles.formSelect} name="status" value={form.status} onChange={handleChange}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>Hidden</label>
                <select className={styles.formSelect} name="hidden" value={form.hidden} onChange={(e) => setForm({ ...form, hidden: e.target.value === "true" })}>
                  <option value="false">No (Visible)</option>
                  <option value="true">Yes (Hidden)</option>
                </select>
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Tags</label>
                <input className={styles.formInput} name="tags" value={form.tags} onChange={handleChange} placeholder="Innovation, IT, AI (comma separated)" />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Prizes</label>
                <input className={styles.formInput} name="prizes" value={form.prizes} onChange={handleChange} />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Official URL</label>
                <input className={styles.formInput} name="official_url" type="url" value={form.official_url} onChange={handleChange} />
              </div>

              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Poster Image</label>
                <input type="file" accept="image/*" onChange={handlePoster} className={styles.formInput} />
                {posterPreview && <img src={posterPreview} className={styles.posterPreview} alt="Preview" />}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link href="/admin/competitions" className={styles.cancelBtn}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
