import express from "express";
import { checkJwt } from "../middleware/auth.js";
import {
  addAccount,
  getAccounts,
  updateAccount,
  getAccountDetails,
  addContribution,
  deleteAccount,
} from "../controllers/accounts.js";

const router = express.Router();

// All /api/accounts/* routes require a valid JWT
router.use(checkJwt);

router.get("/", getAccounts);
router.post("/", addAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.get("/:id", getAccountDetails);
router.post("/:id/contributions", addContribution);

export default router;
