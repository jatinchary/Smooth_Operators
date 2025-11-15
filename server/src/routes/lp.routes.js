import { Router } from 'express';
import { postCreateOrg, putUpdateOrg, postCreateAssociation } from '../controllers/lp.controller.js';

const router = Router();

router.post('/lp/orgs', postCreateOrg);
router.put('/lp/orgs/:dealerId', putUpdateOrg);
router.post('/lp/orgs/associations', postCreateAssociation);

export default router;


