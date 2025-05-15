import express from "express";
import { checkJwt } from "../middleware/auth.js";
import { listSubusers, createSubuser, getSubuser, deleteSubuser } from "../controllers/subusers.js";

const router = express.Router();
router.use(checkJwt);

router.get("/",  listSubusers);
router.post("/", createSubuser);
router.get("/:id", getSubuser);
router.delete("/:id", deleteSubuser);

export default router;
