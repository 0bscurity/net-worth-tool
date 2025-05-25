import express from "express";
import { checkJwt } from "../middleware/auth.js";
import {
  addAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  getAccountDetails,
  addContribution,
  deleteContribution,
  addCategory,
  updateCategory,
  deleteCategory,
  withdraw,
} from "../controllers/accounts.js";

import holdingsRoutes from './holdings.js';

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
router.post("/:id/withdraw", withdraw);

// Category management routes
router.post("/:id/categories", addCategory);
router.put("/:id/categories/:categoryId", updateCategory);
router.delete("/:id/categories/:categoryId", deleteCategory);

router.use('/:id/holdings', holdingsRoutes);


export default router;
