import { Router } from "express";
import { listDealershipsHandler, getDealershipHandler } from "../controllers/dealerships.controller.js";

const router = Router();

router.get("/dealerships", listDealershipsHandler);
router.get("/dealerships/:dealershipId", getDealershipHandler);

export default router;




