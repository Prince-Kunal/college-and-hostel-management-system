import { Router } from 'express';
import { getStudentProfile, onboardStudent } from '../controllers/student.controller.js';

const router = Router();

router.get('/:uid', getStudentProfile);
router.post('/:uid/onboarding', onboardStudent);

export default router;
