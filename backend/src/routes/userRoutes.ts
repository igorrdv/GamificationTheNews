import { Router } from "express";
import { getUserData, getUserReadDates } from "../controllers/userController";

const router = Router();

router.get("/:email", getUserData);
router.get("/:email/reads", getUserReadDates);

export default router;
