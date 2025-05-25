import express from "express";
import { checkJwt } from "../middleware/auth.js";
import {
  addHolding,
  getHoldings,
  deleteHolding,
  addLot,
  updateLot,
  deleteLot,
} from "../controllers/holdings.js";

const router = express.Router({ mergeParams: true });
router.use(checkJwt);

// /api/accounts/:id/holdings
router.get("/", getHoldings);
router.post("/", addHolding);
router.delete("/:holdingId", deleteHolding);

// /api/accounts/:id/holdings/:holdingId/lots
router.post("/:holdingId/lots", addLot);
router.put("/:holdingId/lots/:lotId", updateLot);
router.delete("/:holdingId/lots/:lotId", deleteLot);

export default router;
