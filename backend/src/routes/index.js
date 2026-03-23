import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Base auth route
router.use('/auth', authRoutes);

export default router;
