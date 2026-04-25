import { Router } from 'express';
import { createEvent, getEvents, enrollEvent, getMyEnrollments } from '../controllers/event.controller.js';

const router = Router();

router.post('/', createEvent);
router.get('/', getEvents);
router.post('/:eventId/enroll', enrollEvent);
router.get('/my/:uid', getMyEnrollments);

export default router;
