import { Router } from 'express';
import { createNotification, getNotifications, markAsRead } from '../controllers/notification.controller.js';

const router = Router();

router.post('/', createNotification);
router.get('/:uid', getNotifications);
router.post('/:id/read', markAsRead);

export default router;
