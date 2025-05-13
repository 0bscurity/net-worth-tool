// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import acctRoutes from "./routes/accounts.js";
import checkJwt from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Public health‐check
app.get("/api/health", (_, res) =>
  res.status(200).json({ status: "ok" })
);

// Protected routes
app.use("/api/accounts", checkJwt, acctRoutes);

// Global JSON error handler (so you see errors as JSON)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
