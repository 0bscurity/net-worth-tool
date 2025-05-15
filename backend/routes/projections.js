import express from "express";
import { checkJwt } from "../middleware/auth.js";
import {
  listProjections,
  createProjection,
  getProjectionDetail,
} from "../controllers/projections.js";

const router = express.Router();
router.use(checkJwt);

router.route("/")
  .get(listProjections)
  .post(createProjection);

router.route("/:id")
  .get(getProjectionDetail);

export default router;