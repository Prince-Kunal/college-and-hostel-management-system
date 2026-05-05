import { Router } from 'express';
import { 
    createRoom, allocateRoom, getRooms, getAllocations,
    setMenu, getMenu,
    applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getActiveLeaves,
    submitComplaint, getMyComplaints, getAllComplaints, resolveComplaint
} from '../controllers/hostel.controller.js';

const router = Router();

// Rooms & Allocations
router.post('/rooms', createRoom);
router.get('/rooms', getRooms);
router.post('/allocations', allocateRoom);
router.get('/allocations', getAllocations);

// Mess Menu
router.put('/menu', setMenu);
router.get('/menu/:date', getMenu);

// Leave Management
router.post('/leave', applyLeave);
router.get('/leave/active', getActiveLeaves);
router.get('/leave/student/:uid', getMyLeaves);
router.get('/leave/admin', getAllLeaves);
router.put('/leave/:id/status', updateLeaveStatus);

// Complaints Management
router.post('/complaints', submitComplaint);
router.get('/complaints/student/:uid', getMyComplaints);
router.get('/complaints/admin', getAllComplaints);
router.put('/complaints/:id/resolve', resolveComplaint);

export default router;
