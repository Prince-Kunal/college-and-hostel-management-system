import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/admin.controller.js';

const router = Router();

router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
