import { Router } from 'express';
import { chatWithMomo } from '../controllers/chatController.js';

const router = Router();
router.post('/chat', chatWithMomo);
export default router;
