import { Router } from 'express';
import { createSubject, getSubjects } from '../controllers/subject.controller.js';

const router = Router();

router.post('/', createSubject);
router.get('/', getSubjects);

export default router;
