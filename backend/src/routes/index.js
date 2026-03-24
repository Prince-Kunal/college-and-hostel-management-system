import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Base auth route
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
