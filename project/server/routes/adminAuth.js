const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv=require("dotenv");
dotenv.config();

const JWT_SECRET = "supersecureadminsecret"; // Move this to .env in production
const ADMIN_SECRET_KEY=process.env.ADMIN_SECRET_KEY;

// Admin Signup
router.post("/admin/signup", async (req, res) => {
  const { email, password } = req.body;


  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.json({ success: false, error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ email, password: hashedPassword });

    const token = jwt.sign({ email }, JWT_SECRET);
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Login
router.post("/admin/login", async (req, res) => {
  const { adminKey } = req.body;

  try {
    // ✅ Only check the secret key
    if (adminKey !== ADMIN_SECRET_KEY) {
      return res.json({ success: false, error: "Invalid admin key" });
    }

    // Issue a token for session
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
