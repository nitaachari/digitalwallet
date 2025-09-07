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


// 🔹 Fraud Detection Rules
async function fraudCheck(userId, amount) {
  // Rule 1: single transaction > ₹10,000 (1,000,000 paise)
  if (amount > 1_000_000) return "over_single_limit";

  // Rule 2: total sent in last 24h > ₹25,000 (2,500,000 paise)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dayAgg = await Tx.aggregate([
    { $match: { userId, createdAt: { $gte: since }, type: "SEND" } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const total = dayAgg[0]?.total || 0;
  const count = dayAgg[0]?.count || 0;
  if (total + amount > 2_500_000) return "over_daily_limit";

  // Rule 3: more than 5 transactions in 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await Tx.countDocuments({
    userId,
    type: "SEND",
    createdAt: { $gte: tenMinAgo },
  });
  if (recentCount >= 5) return "too_many_recent";

  return null;
}

// 🔹 1. Check Balance
// router.get("/balance", auth, async (req, res) => {
//   const user = await User.findById(req.userId);
//   res.json({ balancePaise: user.balance });
// });

// router.post("/mock-topup", auth, async (req, res) => {
//   try {
//     const { amountPaise } = req.body;
//     if (!amountPaise || amountPaise <= 0) {
//       return res.status(400).json({ error: "Invalid amount" });
//     }

//     const user = await User.findById(req.userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // Increase balance
//     user.balance += amountPaise;
//     await user.save();

//     // Record transaction
//     await Tx.create({
//       userId: user._id,
//       type: "TOPUP",
//       amount: amountPaise,
//       status: "MOCK_SUCCESS", // mark it as a mock top-up
//     });

//     res.json({ success: true, balance: user.balance });
//   } catch (err) {
//     console.error("Mock top-up error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔹 2. Add Money (Stripe intent)
// router.post("/add-intent", auth, async (req, res) => {
//   try {
//     const { amountPaise } = req.body;
//     if (!amountPaise || amountPaise <= 0) {
//       return res.status(400).json({ error: "Invalid amount" });
//     }

//     const pi = await stripe.paymentIntents.create({
//       amount: amountPaise,
//       currency: "inr",
//       automatic_payment_methods: { enabled: true },
//       metadata: { userId: req.userId },
//     });

//     res.json({ clientSecret: pi.client_secret });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔹 3. Send Money (with fraud checks)
// router.post("/send", auth, async (req, res) => {
//   const { toEmail, amountPaise } = req.body;
//   if (!toEmail || !amountPaise || amountPaise <= 0) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   const sender = await User.findById(req.userId);
//   const receiver = await User.findOne({ email: toEmail });
//   if (!receiver) return res.status(404).json({ error: "Recipient not found" });
//   if (String(sender._id) === String(receiver._id)) {
//     return res.status(400).json({ error: "Cannot send to self" });
//   }

//   // Check fraud rules
//   const reason = await fraudCheck(sender._id, amountPaise);
//   if (reason) {
//     await Tx.create({
//       userId: sender._id,
//       type: "SEND",
//       amount: amountPaise,
//       counterparty: receiver.email,
//       status: "FLAGGED",
//     });
//     return res.status(403).json({ error: `Transaction flagged: ${reason}` });
//   }

//   if (sender.balance < amountPaise) {
//     return res.status(400).json({ error: "Insufficient funds" });
//   }

//   // Deduct + credit
//   sender.balance -= amountPaise;
//   receiver.balance += amountPaise;
//   await sender.save();
//   await receiver.save();

//   await Tx.create({
//     userId: sender._id,
//     type: "SEND",
//     amount: amountPaise,
//     counterparty: receiver.email,
//     status: "SUCCESS",
//   });
//   await Tx.create({
//     userId: receiver._id,
//     type: "RECEIVE",
//     amount: amountPaise,
//     counterparty: sender.email,
//     status: "SUCCESS",
//   });

//   res.json({ ok: true });
// });

// // 🔹 4. Transaction History
// router.get("/tx", auth, async (req, res) => {
//   const list = await Tx.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(100);
//   res.json(list);
// });

// // 🔹 5. Stripe Webhook
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         req.headers["stripe-signature"],
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "payment_intent.succeeded") {
//       const pi = event.data.object;
//       const userId = pi.metadata.userId;

//       const user = await User.findById(userId);
//       if (user) {
//         user.balance += pi.amount_received;
//         await user.save();

//         await Tx.create({
//           userId,
//           type: "TOPUP",
//           amount: pi.amount_received,
//           status: "SUCCESS",
//         });
//       }
//     }

//     res.json({ received: true });
//   }
// );

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

    await Tx.create({
      userId: user._id,
      type: "TOPUP",
      amount: amountPaise,
      status: "SUCCESS",
    });

    res.json({ success: true, balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

