import { Router } from "express";
import { createOrder, deleteOrder, listOrders, listPublicOrders, updateOrder } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/public", listPublicOrders);
router.post("/", createOrder);
router.get("/", requireAuth, listOrders);
router.patch("/:id", requireAuth, updateOrder);
router.delete("/:id", requireAuth, deleteOrder);

export default router;
