// index.js
dotenv.config();

console.log("→ MONGO_URI:", process.env.MONGO_URI);
console.log("→ AUTH0_DOMAIN:", process.env.AUTH0_DOMAIN);
console.log("→ AUTH0_AUDIENCE:", process.env.AUTH0_AUDIENCE);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import acctRoutes from "./routes/accounts.js";
import { checkJwt } from "./middleware/auth.js";

const app = express();
app.use(
  cors()
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Public health‐check
app.get("/api/health", (req, res) => {
  console.log("🩺 /api/health called");
  res.status(200).json({ status: "ok" });
});

// Protected routes
app.use("/api/accounts", checkJwt, acctRoutes);

// JSON error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
