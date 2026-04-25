import { Router } from 'express';
import { generateToken, markAttendance, getStudentAttendance } from '../controllers/attendance.controller.js';

const router = Router();

router.post('/generate', generateToken);
router.post('/mark', markAttendance);
router.get('/student/:studentId', getStudentAttendance);

export default router;
