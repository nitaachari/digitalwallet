import { Link } from "react-router-dom";

export default function UserDashboard() {
  const name = localStorage.getItem("name") || "User";

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div style={{ maxWidth: "720px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome, {name}</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li
            className="list-content"
            id="user-logout"
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <Link to="/add" style={btnStyle}>Add Balance</Link>
        <Link to="/balance" style={btnStyle}>Check Balance</Link>
        <Link to="/send" style={btnStyle}>Send Money</Link>
        <Link to="/history" style={btnStyle}>Transaction History</Link>
      </div>
    </div>
  );
}

const btnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  fontSize: "1.2rem",
  borderRadius: "12px",
  border: "2px solid #444",
  background: "#f8f8f8",
  cursor: "pointer",
  textDecoration: "none",
  color: "black",
};


