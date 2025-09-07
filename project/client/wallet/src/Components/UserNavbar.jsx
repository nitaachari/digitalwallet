import { Link } from "react-router-dom";

export default function Navbar({ onLogout }) {
  return (
    <nav style={navStyle}>
      <h2 style={{ margin: 0 }}>💳 Wallet</h2>
      <div style={linkBox}>
        <Link to="/" style={linkStyle}>Dashboard</Link>
        <Link to="/add" style={linkStyle}>Add Balance</Link>
        <Link to="/balance" style={linkStyle}>Check Balance</Link>
        <Link to="/send" style={linkStyle}>Send Money</Link>
        <Link to="/history" style={linkStyle}>Transactions</Link>
        <button onClick={onLogout} style={logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  background: "#f2f2f2",
  borderBottom: "2px solid #ddd",
};

const linkBox = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
};

const linkStyle = {
  textDecoration: "none",
  color: "black",
  fontWeight: "500",
};

const logoutBtn = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #444",
  cursor: "pointer",
  background: "#fff",
};
