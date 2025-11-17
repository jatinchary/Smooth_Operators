import { Router } from "express";
import {
  setupFinanceProvider,
  importCreditAppLenders,
  saveCreditAppLenders,
} from "../controllers/financeProvider.controller.js";

const router = Router();

router.post("/setup-finance-provider", setupFinanceProvider);
router.post("/import-credit-app-lenders", importCreditAppLenders);
router.post("/save-credit-app-lenders", saveCreditAppLenders);

export default router;
