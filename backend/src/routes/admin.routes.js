import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/admin.controller.js';

const router = Router();

router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);

export default router;
