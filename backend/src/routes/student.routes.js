import { Router } from 'express';
import { getStudentProfile, onboardStudent, updateStudentProfile } from '../controllers/student.controller.js';

const router = Router();

router.get('/:uid', getStudentProfile);
router.post('/:uid/onboarding', onboardStudent);
router.put('/:uid/profile', updateStudentProfile);

export default router;
