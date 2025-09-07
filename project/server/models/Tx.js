import mongoose from "mongoose";

const txSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    type: { type: String, enum: ["TOPUP", "SEND", "RECEIVE"] },
    amount: Number,
    counterparty: String,
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING", "FLAGGED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tx", txSchema);
