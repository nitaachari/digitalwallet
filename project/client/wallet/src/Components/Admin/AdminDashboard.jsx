import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [txs, setTxs] = useState([]);

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

  useEffect(() => {
    loadFlagged();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <h2>Admin Dashboard – Flagged Transactions</h2>
      {!txs.length && <p>No flagged transactions.</p>}
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
              <strong>{t.type}</strong> → {t.counterparty || "N/A"}  
              <br />
              Amount: ₹{(t.amount / 100).toFixed(2)}  
              <br />
              Status: {t.status}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => approve(t._id)} style={btn}>Approve</button>
              <button onClick={() => reject(t._id)} style={btn}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const btn = {
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  border: "1px solid #444",
  cursor: "pointer",
};
