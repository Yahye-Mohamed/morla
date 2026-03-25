import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../controllers/productController.js";

const router = Router();

router.get("/", listProducts);
router.post("/", requireAuth, createProduct);
router.patch("/:id", requireAuth, updateProduct);
router.delete("/:id", requireAuth, deleteProduct);

export default router;
