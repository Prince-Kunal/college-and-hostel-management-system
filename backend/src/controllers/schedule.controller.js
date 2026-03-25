import { db } from '../firebase.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export const createSchedule = async (req, res) => {
  try {
    const { batchId, subjectId, facultyId, day, startTime, endTime } = req.body;

    if (!batchId || !subjectId || !facultyId || !day || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required uniquely explicit schedule parameters natively' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'Class explicitly requires end time to safely succeed start time natively bounds explicitly' });
    }

    // Role-based explicit logic: Verify the faculty mapping physically mapped exclusively referencing this specific exact subset directly natively
    const assignRef = collection(db, 'facultyAssignments');
    const q = query(
      assignRef,
      where('batchId', '==', batchId),
      where('subjectId', '==', subjectId),
      where('facultyId', '==', facultyId)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return res.status(403).json({ 
        success: false, 
        message: 'Explicitly Forbidden Authorization Logic: You inherently exist disconnected from explicit mappings required configuring targets strictly allocated across distinct batches safely natively.' 
      });
    }

    const newSchedule = {
      batchId,
      subjectId,
      facultyId,
      day,
      startTime,
      endTime,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'schedules'), newSchedule);

    return res.status(201).json({
      success: true,
      message: 'Schedule inherently allocated safely natively within mapping rules uniquely natively correctly.',
      data: { id: docRef.id, ...newSchedule }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Fatal intrinsic explicitly executing schedule constraints physically directly.' });
  }
};

export const getSchedules = async (req, res) => {
  try {
    const schedulesRef = collection(db, 'schedules');
    const snapshot = await getDocs(schedulesRef);
    
    const schedules = [];
    snapshot.forEach(doc => {
      schedules.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error executing generic fetch algorithms explicitly natively mapping strictly uniquely.' });
  }
};

export const getStudentSchedules = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Explicitly navigate into Users scope locally securely establishing valid UUID schemas mapping implicitly dynamically uniquely natively securely
    const userRef = doc(db, 'users', studentId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: 'Student completely missing mapped schema inherently mapping explicitly cleanly.' });
    }
    
    const userData = userSnap.data();
    const batchId = userData.batchId;
    
    if (!batchId) {
      return res.status(400).json({ success: false, message: 'Enrolled Explicit Target Student logically implicitly lacks native active mappings pointing towards implicit distinct batch arrays uniquely natively inherently uniquely explicitly.' });
    }
    
    // Inherently execute specific querying targeting arrays natively matched securely inherently implicitly within global namespace purely independently intrinsically specifically cleanly
    const schedRef = collection(db, 'schedules');
    const q = query(schedRef, where('batchId', '==', batchId));
    const qs = await getDocs(q);
    
    const schedules = [];
    qs.forEach(d => {
      schedules.push({ id: d.id, ...d.data() });
    });
    
    return res.status(200).json({ success: true, data: schedules });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error resolving deeply nested matrices specific completely efficiently querying schemas intrinsically accurately locally cleanly mapped specifically uniquely natively isolated distinctly strictly directly.' });
  }
};

export const getFacultySchedules = async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    const schedRef = collection(db, 'schedules');
    const q = query(schedRef, where('facultyId', '==', facultyId));
    const qs = await getDocs(q);
    
    const schedules = [];
    qs.forEach(d => {
      schedules.push({ id: d.id, ...d.data() });
    });
    
    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error executing implicit faculty fetching logic dynamically directly globally seamlessly.' });
  }
};
