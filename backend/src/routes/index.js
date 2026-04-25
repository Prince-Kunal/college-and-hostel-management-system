import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import batchRoutes from './batch.routes.js';
import subjectRoutes from './subject.routes.js';
import facultyAssignmentRoutes from './facultyAssignment.routes.js';
import facultyRoutes from './faculty.routes.js';
import scheduleRoutes from './schedule.routes.js';
import liveRoutes from './live.routes.js';
import studentRoutes from './student.routes.js';
import eventRoutes from './event.routes.js';
import attendanceRoutes from './attendance.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

// Base auth route
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/batches', batchRoutes);
router.use('/subjects', subjectRoutes);
router.use('/faculty-assignments', facultyAssignmentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/live', liveRoutes);
router.use('/student', studentRoutes);
router.use('/events', eventRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);

export default router;
