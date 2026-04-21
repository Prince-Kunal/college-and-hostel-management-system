import { Router } from 'express';
import { startLiveClass, joinLiveClass } from '../controllers/live.controller.js';

const router = Router();

router.post('/start', startLiveClass);
router.get('/join/:scheduleId', joinLiveClass);

export default router;
