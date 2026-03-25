import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import batchRoutes from './batch.routes.js';
import subjectRoutes from './subject.routes.js';
import facultyAssignmentRoutes from './facultyAssignment.routes.js';
import scheduleRoutes from './schedule.routes.js';

const router = Router();

// Base auth route
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/batches', batchRoutes);
router.use('/subjects', subjectRoutes);
router.use('/faculty-assignments', facultyAssignmentRoutes);
router.use('/schedules', scheduleRoutes);

export default router;
