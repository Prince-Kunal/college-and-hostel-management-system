import { Router } from 'express';
import { createSchedule, getSchedules, getStudentSchedules, getFacultySchedules } from '../controllers/schedule.controller.js';

const router = Router();

router.post('/', createSchedule);
router.get('/', getSchedules);
router.get('/student/:studentId', getStudentSchedules);
router.get('/faculty/:facultyId', getFacultySchedules);

export default router;
