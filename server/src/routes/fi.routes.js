import { Router } from 'express';
import { postDealerProduct, postProviderList } from '../controllers/fi.controller.js';

const router = Router();

router.post('/ex1/dealer-product', postDealerProduct);
router.post('/ex1/provider-list', postProviderList);

export default router;


