import {Router} from 'express';
import {createJournalEntry} from '../controllers/journalController.js';


const router = Router();

router.post('/journal', createJournalEntry);

export default router;