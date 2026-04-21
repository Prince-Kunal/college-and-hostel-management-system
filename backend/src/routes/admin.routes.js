import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser, getBatchesDetails } from '../controllers/admin.controller.js';

const router = Router();

router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/batches-details', getBatchesDetails);

export default router;
