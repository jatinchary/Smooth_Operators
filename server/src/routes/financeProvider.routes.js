import { Router } from "express";
import {
  setupFinanceProvider,
  importCreditAppLenders,
} from "../controllers/financeProvider.controller.js";

const router = Router();

router.post("/setup-finance-provider", setupFinanceProvider);
router.post("/import-credit-app-lenders", importCreditAppLenders);

export default router;
