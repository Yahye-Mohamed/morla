import { Router } from "express";
import { getCurrentAdmin, loginAdmin } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginAdmin);
router.get("/me", requireAuth, getCurrentAdmin);

export default router;
