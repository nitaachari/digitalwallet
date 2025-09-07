import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/admin.js";
import walletRoutes from "./routes/wallet.js";
import userauthRoutes from "./routes/Createuser.js";

dotenv.config();

const app = express();
app.use(cors());

// JSON parsing
app.use(express.json());

// MongoDB
mongoose.connect(process.env.URL).then(() => console.log("Mongo connected"));

// Routes
app.use(userauthRoutes);        // /createuser, /loginuser
app.use("/admin", adminRoutes); // /admin/flagged, etc.
app.use("/wallet", walletRoutes); // /wallet/add-intent, /wallet/send, etc.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

