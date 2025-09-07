import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import "./AdminSignup.css";
const BASE_URL = import.meta.env.VITE_API_URL;

function AdminSignup() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${BASE_URL}/admin/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (data.success) {
      // ✅ Save token and email to localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminEmail", credentials.email);

      navigate("/admin/create-profile");
    } else {
      alert("Signup failed: " + (data.error || "Something went wrong"));
    }
  };

  return (
    <div className="main-div">
      <div className="first-div"></div>

      <div className="signup">
       
        
        <h4 className="message">Admin Sign Up</h4>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="adminEmail">Email</label>
            <input
              type="email"
              className="form-control"
              id="adminEmail"
              placeholder="Enter email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              className="form-control"
              id="adminPassword"
              placeholder="Enter password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>

          <div className="button">
            <button type="submit" className="btn btn-primary">
              Sign Up
            </button>
            <Link to="/admin/login">
              <button type="button" className="btn custom-btn">
                Already Admin?
              </button>
            </Link>
          </div>
        </form>
      </div>

      <div className="third-div"></div>
    </div>
  );
}

export default AdminSignup;


