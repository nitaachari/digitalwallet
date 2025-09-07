import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import "./AdminLogin.css";
const BASE_URL = import.meta.env.VITE_API_URL;

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (data.success) {
      // ✅ Store token and email in localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminEmail", credentials.email);

      navigate("/adminpanel");
    } else {
      alert("Login failed: " + (data.error || "Invalid credentials"));
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="main-div">
      <div className="first-div"></div>

      <div>
        <h4 className="message">Admin Login Portal</h4>

        <div className="login">
         
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="adminEmail">Email address</label>
              <input
                type="email"
                className="form-control"
                id="adminEmail"
                placeholder="Enter email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                required
              />
              <small id="emailHelp" className="form-text text-muted">
                Only authorized admins can login here.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Password</label>
              <input
                type="password"
                className="form-control"
                id="adminPassword"
                placeholder="Password"
                name="password"
                value={credentials.password}
                onChange={onChange}
                required
              />
            </div>

            <div className="button">
              <button type="submit" className="btn custom-btn">
                Login
              </button>

              <Link to="/admin/signup">
                <button type="button" className="btn btn-primary m-4">
                  I'm a new Admin
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="third-div"></div>
    </div>
  );
}

export default AdminLogin;


