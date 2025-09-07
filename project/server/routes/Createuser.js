import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/UserAuth.js";

dotenv.config();

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// 🔹 Signup
router.post(
  "/createuser",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    const secpassword = await bcrypt.hash(req.body.password, salt);

    try {
      const email = req.body.email;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ errors: "Email already exists" });
      }

      await User.create({
        name: req.body.name,
        number: req.body.number,
        email,
        password: secpassword,
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.json({ success: false });
    }
  }
);

// 🔹 Login
router.post(
  "/loginuser",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const email = req.body.email;
      const userdata = await User.findOne({ email });

      if (!userdata) {
        return res.status(400).json({ errors: "Email does not exist" });
      }

      const comparePass = await bcrypt.compare(req.body.password, userdata.password);
      if (!comparePass) {
        return res.status(400).json({ errors: "Incorrect password" });
      }

      const data = { id: userdata.id };
      const authToken = jwt.sign(data, jwtSecret, { expiresIn: "1h" });

      res.json({ success: true, authToken, name: userdata.name });
    } catch (error) {
      console.error(error);
      res.json({ success: false });
    }
  }
);

export default router;
