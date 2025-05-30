// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import projectionRoutes from "./routes/projections.js";
import acctRoutes from "./routes/accounts.js";
import subuserRoutes from "./routes/subusers.js";
import holdingsRoutes from "./routes/holdings.js";
import { checkJwt } from "./middleware/auth.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

console.log("🔍 Mounting /api/health route");
app.get("/api/health", (req, res) => {
  console.log("🩺 /api/health called");
  res.status(200).json({ status: "ok" });
});

// Protected routes
app.use("/api/accounts", checkJwt, acctRoutes);
app.use("/api/projections", checkJwt, projectionRoutes);
app.use("/api/subusers", checkJwt, subuserRoutes);

// JSON error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
