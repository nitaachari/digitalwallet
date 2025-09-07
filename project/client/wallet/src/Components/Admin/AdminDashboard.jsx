import { useEffect, useState } from "react";

const API = "http://localhost:4000";

export default function AdminDashboard() {
  const [txs, setTxs] = useState([]);
  const [adminName, setAdminName] = useState("");

  async function loadFlagged() {
    const res = await fetch(`${API}/admin/flagged`);
    const data = await res.json();
    setTxs(data);
  }

  async function approve(id) {
    await fetch(`${API}/admin/approve/${id}`, { method: "POST" });
    loadFlagged();
  }

  async function reject(id) {
    await fetch(`${API}/admin/reject/${id}`, { method: "POST" });
    loadFlagged();
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/"; // go back to login
  }

  useEffect(() => {
    loadFlagged();
    const stored = localStorage.getItem("adminName");
    setAdminName(stored || "Admin");
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome, {adminName}</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li
            className="list-content"
            id="admin-logout"
            onClick={handleLogout}
            style={{
              cursor: "pointer",
              padding: "0.5rem 1rem",
              border: "1px solid #444",
              borderRadius: "6px",
              display: "inline-block",
            }}
          >
            Logout
          </li>
        </ul>
      </header>

      <h3 style={{ marginTop: "1.5rem" }}>Flagged Transactions</h3>
      {!txs.length && <p>No flagged transactions 🚀</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {txs.map((t) => (
          <li
            key={t._id}
            style={{
              border: "1px solid #ddd",
              margin: "0.5rem 0",
              padding: "0.5rem",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>{t.type}</strong> – {t.counterparty || "N/A"} <br />
              Amount: ₹{(t.amount / 100).toFixed(2)} <br />
              Status: {t.status}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => approve(t._id)}>Approve</button>
              <button onClick={() => reject(t._id)}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

