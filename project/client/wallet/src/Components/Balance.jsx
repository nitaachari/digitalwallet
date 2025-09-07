import { useEffect, useState } from "react";

const API = "http://localhost:4000";

export default function Balance({ token }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch(`${API}/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setBalance(d.balancePaise));
  }, [token]);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Your Balance</h3>
      <p style={{ fontSize: "1.5rem" }}>₹{(balance / 100).toFixed(2)}</p>
    </div>
  );
}
