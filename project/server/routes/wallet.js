import express from "express";
import Stripe from "stripe";
import User from "../models/UserAuth.js";
import Tx from "../models/Tx.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();   

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET || "secret";


router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amountPaise } = req.body;

    if (!amountPaise || amountPaise <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPaise,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 2. Add Balance (using email instead of JWT)
router.post("/addbalance", async (req, res) => {
  try {
    const { email, amountPaise } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance += amountPaise;
    await user.save();

    // log the top-up as a transaction
    await Tx.create({
      userId: user._id,
      type: "TOPUP",
      amount: amountPaise,
      status: "SUCCESS",
    });

    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 3. Check Balance
router.post("/balance", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 4. Send Money (transfer between two users)
// 🔹 Send Money with Fraud Checks
router.post("/send", async (req, res) => {
  try {
    const { fromEmail, toEmail, amountPaise } = req.body;

    if (!fromEmail || !toEmail || !amountPaise) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (fromEmail === toEmail) {
      return res.status(400).json({ error: "Cannot send money to self" });
    }

    const sender = await User.findOne({ email: fromEmail });
    const receiver = await User.findOne({ email: toEmail });

    if (!sender) return res.status(404).json({ error: "Sender not found" });
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    // ✅ Fraud Rules
    if (amountPaise > 1_000_000) { // > ₹10,000
      await Tx.create({
        userId: sender._id,
        type: "SEND",
        amount: amountPaise,
        counterparty: receiver.email,
        status: "FLAGGED",
      });
      return res.status(403).json({ error: "Transaction flagged: amount too high" });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dayTotal = await Tx.aggregate([
      { $match: { userId: sender._id, type: "SEND", createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    if ((dayTotal[0]?.total || 0) + amountPaise > 2_500_000) { // > ₹25,000 in 24h
      await Tx.create({
        userId: sender._id,
        type: "SEND",
        amount: amountPaise,
        counterparty: receiver.email,
        status: "FLAGGED",
      });
      return res.status(403).json({ error: "Transaction flagged: daily limit exceeded" });
    }

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentTxCount = await Tx.countDocuments({
      userId: sender._id,
      type: "SEND",
      createdAt: { $gte: tenMinAgo },
    });
    if (recentTxCount >= 5) {
      await Tx.create({
        userId: sender._id,
        type: "SEND",
        amount: amountPaise,
        counterparty: receiver.email,
        status: "FLAGGED",
      });
      return res.status(403).json({ error: "Transaction flagged: too many recent transfers" });
    }

    // ✅ If safe → move money
    if (sender.balance < amountPaise) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    sender.balance -= amountPaise;
    receiver.balance += amountPaise;
    await sender.save();
    await receiver.save();

    // Log transactions
    await Tx.create({
      userId: sender._id,
      type: "SEND",
      amount: amountPaise,
      counterparty: receiver.email,
      status: "SUCCESS",
    });
    await Tx.create({
      userId: receiver._id,
      type: "RECEIVE",
      amount: amountPaise,
      counterparty: sender.email,
      status: "SUCCESS",
    });

    res.json({ success: true, newBalance: sender.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 5. Transaction History
router.post("/history", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const txs = await Tx.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);

    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

