import { Router } from "express";
import {
  postDealerProduct,
  postProviderList,
  postProductList,
  importProducts,
} from "../controllers/fi.controller.js";

const router = Router();

router.post("/ex1/dealer-product", postDealerProduct);
router.post("/ex1/provider-list", postProviderList);
router.post("/ex1/product-list", postProductList);
router.post("/ex1/import-products", importProducts);

export default router;
