import {Router} from 'express';
import journalRoutes from './journal.js';


const router = Router();

router.use('/api', journalRoutes);

export default router;