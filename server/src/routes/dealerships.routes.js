import { Router } from "express";
import { listDealershipsHandler, getDealershipHandler, createDealershipHandler } from "../controllers/dealerships.controller.js";

const router = Router();

router.get("/dealerships", listDealershipsHandler);
router.get("/dealerships/:dealershipId", getDealershipHandler);
router.post("/dealerships", createDealershipHandler);

export default router;




