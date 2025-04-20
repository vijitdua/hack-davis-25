import {Router} from 'express';
import {createJournalEntry} from '../controllers/journalController.js';
import {getEmotionSummary} from '../controllers/journalController.js'; 
import { getAnalysisSummary } from '../controllers/journalController.js';

const router = Router();

router.post('/journal', createJournalEntry);

router.get("/journal/summary", getEmotionSummary); // New route for emotion summary



router.get('/journal/analysis-summary', getAnalysisSummary);

export default router;