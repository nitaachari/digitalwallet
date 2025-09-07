import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;


export default function Balance() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem("useremail");
    if (!email) return;

    fetch(`${API}/wallet/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.balance !== undefined) {
          setBalance(d.balance);
        }
      });
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Your Balance</h3>
      <p style={{ fontSize: "1.5rem" }}>₹{(balance / 100).toFixed(2)}</p>
    </div>
  );
}
