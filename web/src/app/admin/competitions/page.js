"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "../admin.module.css";

export default function AdminCompetitions() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "true") {
      router.replace("/admin");
      return;
    }
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data } = await supabase.from("competitions").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("competitions").delete().eq("id", deleteId);
    if (error) {
      showToast("Delete failed: " + error.message, "error");
    } else {
      showToast("Competition deleted", "success");
      setItems(items.filter((i) => i.id !== deleteId));
    }
    setDeleteId(null);
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = search.trim()
    ? items.filter((i) =>
        (i.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.organizer || "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className={styles.page}>
      {/* Top Bar */}
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
          <Link href="/" className={styles.topBarLink}>View Site →</Link>
        </div>
        <button className={styles.logoutBtn} onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); }}>Logout</button>
      </div>

      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Competitions ({items.length})</h1>
          <Link href="/admin/competitions/add" className={styles.addBtn}>+ Add Competition</Link>
        </div>

        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            placeholder="Search by title or organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No competitions found</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.poster_url ? (
                        <img src={item.poster_url} className={styles.tablePoster} alt="" />
                      ) : (
                        <div style={{ width: 48, height: 48, background: "#F1F5F9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>🏆</div>
                      )}
                    </td>
                    <td><div className={styles.tableTitle}>{item.title}</div></td>
                    <td>{(item.organizer || "").substring(0, 30)}</td>
                    <td>{item.registration_deadline || "TBC"}</td>
                    <td>
                      <span className={item.status === "open" ? styles.statusOpen : styles.statusClosed}>
                        {item.status || "open"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/competitions/edit/${item.id}`} className={styles.editBtn}>Edit</Link>
                        <button className={styles.deleteBtn} onClick={() => setDeleteId(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.dialogTitle}>Delete Competition?</h3>
            <p className={styles.dialogText}>This action cannot be undone.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
