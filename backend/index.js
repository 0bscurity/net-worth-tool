// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import acctRoutes from "./routes/accounts.js";
import { checkJwt } from "./middleware/auth.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Public health‐check (no auth)
app.get("/api/health", (_, res) => res.status(200).json({ status: "ok" }));

// All other /api routes require a valid token
// e.g. this will protect /api/accounts/*
app.use("/api/accounts", checkJwt, acctRoutes);

// If you really want a root‐level unprotected route
// app.get("/", (_, res) => res.send("API is up 🚀"));

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
