import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import acctRoutes from "./routes/accounts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


// API routes
app.use("/api/accounts", acctRoutes);

// Health check
app.get("/api/health", (_, res) => res.status(200).json({ status: "ok" }));
app.get("/", (_, res) => res.send("API is up 🚀"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
