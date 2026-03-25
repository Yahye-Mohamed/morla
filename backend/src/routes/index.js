import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import orderRoutes from "./orderRoutes.js";
import productRoutes from "./productRoutes.js";

const router = Router();

router.get("/", (request, response) => {
  response.json({
    name: "Morla Cafe API",
    status: "ready",
    message: "Admin backend is live.",
  });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);

export default router;
