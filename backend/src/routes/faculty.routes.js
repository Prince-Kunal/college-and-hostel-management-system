import { Router } from 'express';
import { getMyStudents } from '../controllers/faculty.controller.js';

const router = Router();

router.get('/my-students/:facultyId', getMyStudents);

export default router;
