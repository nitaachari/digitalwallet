import express from "express";
import User from "../models/UserAuth.js";
import Tx from "../models/Tx.js";

const router = express.Router();

router.get("/flagged", async (req, res) => {
  try {
    const flagged = await Tx.find({ status: "FLAGGED" }).sort({ createdAt: -1 });
    res.json(flagged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Approve a flagged transaction
router.post("/approve/:id", async (req, res) => {
  try {
    const tx = await Tx.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.status !== "FLAGGED") return res.status(400).json({ error: "Not flagged" });

    const sender = await User.findById(tx.userId);
    const receiver = await User.findOne({ email: tx.counterparty });
    if (!sender || !receiver) return res.status(400).json({ error: "Invalid users" });

    if (sender.balance < tx.amount) {
      tx.status = "FAILED";
      await tx.save();
      return res.status(400).json({ error: "Sender has insufficient funds at approval time" });
    }

    // Move money
    sender.balance -= tx.amount;
    receiver.balance += tx.amount;
    await sender.save();
    await receiver.save();

    tx.status = "SUCCESS";
    await tx.save();

    // Add RECEIVE record for receiver
    await Tx.create({
      userId: receiver._id,
      type: "RECEIVE",
      amount: tx.amount,
      counterparty: sender.email,
      status: "SUCCESS",
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Reject a flagged transaction
router.post("/reject/:id", async (req, res) => {
  try {
    const tx = await Tx.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.status !== "FLAGGED") return res.status(400).json({ error: "Not flagged" });

    tx.status = "FAILED";
    await tx.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;