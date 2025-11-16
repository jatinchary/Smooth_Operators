import { Router } from "express";
import { setupFinanceProvider } from "../controllers/financeProvider.controller.js";

const router = Router();

router.post("/setup-finance-provider", setupFinanceProvider);

export default router;
