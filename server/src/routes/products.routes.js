import { Router } from "express";
import { postProductsLogSummary } from "../controllers/products.controller.js";

const router = Router();

router.post("/products/log-summary", postProductsLogSummary);

export default router;


