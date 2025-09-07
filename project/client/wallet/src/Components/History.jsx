import { useEffect, useState } from "react";

const API = "http://localhost:4000";

export default function History({ token }) {
  const [tx, setTx] = useState([]);

  useEffect(() => {
    fetch(`${API}/wallet/tx`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTx);
  }, [token]);

  return (
    <div style={{ maxWidth: "600px", margin: "1rem auto" }}>
      <h3>Transaction History</h3>
      {!tx.length && <p>No transactions yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tx.map((t) => (
          <li key={t._id} style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t.type} {t.counterparty ? `(${t.counterparty})` : ""}</span>
              <span>{new Date(t.createdAt).toLocaleString()}</span>
              <strong>{t.type === "SEND" ? "-" : "+"}₹{(t.amount / 100).toFixed(2)}</strong>
            </div>
            <small>Status: {t.status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
