import { Router } from 'express';
import { createBatch, getBatches, assignStudent } from '../controllers/batch.controller.js';

const router = Router();

router.post('/', createBatch);
router.get('/', getBatches);
router.put('/:batchId/assign-student', assignStudent);

export default router;
