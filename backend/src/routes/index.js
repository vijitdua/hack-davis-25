import {Router} from 'express';
import {journalController} from '../controllers/journalController.js';
import JournalEntry from '../models/JournalEntry';

const router = Router();

router.post("/journal", joynalController.createJournalEntry);

export default router;