import { Router } from "express";
import {
  getCreditAppLendersController,
  getDealerSettingsController,
} from "../controllers/tekion.controller.js";

const router = Router();

router.post("/deal/settings", getDealerSettingsController);
router.post("/dms/credit-app-lenders", getCreditAppLendersController);

export default router;
