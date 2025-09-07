import { useState } from "react";

const API = import.meta.env.VITE_API_URL;


export default function SendMoney() {
  const [to, setTo] = useState("");
  const [amt, setAmt] = useState("");

  async function send(e) {
    e.preventDefault();
    const fromEmail = localStorage.getItem("useremail");

    const res = await fetch(`${API}/wallet/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromEmail,
        toEmail: to,
        amountPaise: Number(amt) * 100,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert("✅ Transfer successful");
      setTo("");
      setAmt("");
    } else {
      alert("❌ " + (data.error || "Something went wrong"));
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Send Money</h3>
      <form
        onSubmit={send}
        style={{
          display: "grid",
          gap: "0.5rem",
          maxWidth: "300px",
          margin: "1rem auto",
        }}
      >
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient Email"
          required
        />
        <input
          type="number"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
          placeholder="Amount ₹"
          required
        />
        <button type="submit" style={btn}>
          Send
        </button>
      </form>
    </div>
  );
}

const btn = { padding: "0.5rem 1rem", cursor: "pointer" };
