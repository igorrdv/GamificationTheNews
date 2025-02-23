import { Router } from "express";
import { getMetrics } from "../controllers/adminController";

const router = Router();

router.get("/metrics", getMetrics);

export default router;
