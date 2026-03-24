import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import batchRoutes from './batch.routes.js';

const router = Router();

// Base auth route
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/batches', batchRoutes);

export default router;
