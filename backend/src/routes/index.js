import {Router} from 'express';
import journalRoutes from './journal.js';
import chatRoutes from './chat.js';


const router = Router();

router.use('/api', journalRoutes);

router.use('/api', chatRoutes);
export default router;