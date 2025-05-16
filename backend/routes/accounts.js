import express from "express";
import { checkJwt } from "../middleware/auth.js";
import {
  addAccount,
  getAccounts,
  updateAccount,
  getAccountDetails,
  addContribution,
  deleteAccount,
  addCategory,
  updateCategory,
  deleteCategory,
  deleteContribution,
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
router.delete("/:id/contributions/:contributionId", deleteContribution);

// Category management routes
router.post("/:id/categories", addCategory);
router.put("/:id/categories/:categoryId", updateCategory);
router.delete("/:id/categories/:categoryId", deleteCategory);

export default router;
