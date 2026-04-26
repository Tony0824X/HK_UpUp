"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "../admin.module.css";

export default function AdminPapers() {
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
    const { data } = await supabase.from("papers").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("papers").delete().eq("id", deleteId);
    if (error) {
      showToast("Delete failed: " + error.message, "error");
    } else {
      showToast("Paper deleted", "success");
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
        (i.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.abbreviation || "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

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
          <Link href="/" className={styles.topBarLink}>View Site →</Link>
        </div>
        <button className={styles.logoutBtn} onClick={() => { sessionStorage.removeItem("admin_auth"); router.push("/admin"); }}>Logout</button>
      </div>

      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Papers ({items.length})</h1>
          <Link href="/admin/papers/add" className={styles.addBtn}>+ Add Paper</Link>
        </div>

        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            placeholder="Search by name or abbreviation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No papers found</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Abbreviation</th>
                  <th>Full Name</th>
                  <th>Venue</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.abbreviation || "-"}</strong></td>
                    <td><div className={styles.tableTitle}>{item.full_name}</div></td>
                    <td>{(item.venue || "").substring(0, 30)}</td>
                    <td>{item.registration_deadline || "TBC"}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/papers/edit/${item.id}`} className={styles.editBtn}>Edit</Link>
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

      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.dialogTitle}>Delete Paper?</h3>
            <p className={styles.dialogText}>This action cannot be undone.</p>
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
