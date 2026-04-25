import jwt from 'jsonwebtoken';
import { db } from '../firebase.js';
import admin from 'firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'attendance_fallback_secret_123';

export const generateToken = async (req, res) => {
  try {
    const { scheduleId } = req.body;
    if (!scheduleId) {
      return res.status(400).json({ success: false, message: 'Missing scheduleId' });
    }

    // Token expires in 10 seconds
    const token = jwt.sign({ scheduleId, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '10s' });
    
    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error generating token' });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { token, studentId } = req.body;

    if (!token || !studentId) {
      return res.status(400).json({ success: false, message: 'Missing token or studentId' });
    }

    // 1 & 2. Verify JWT token and extract scheduleId
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR code' });
    }
    
    const { scheduleId } = decoded;

    // 3. Fetch student -> get batchId
    const studentRef = db.collection('users').doc(studentId);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const studentData = studentSnap.data();

    if (studentData.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can mark attendance' });
    }

    // 4. Fetch schedule -> get batchId
    const scheduleRef = db.collection('schedules').doc(scheduleId);
    const scheduleSnap = await scheduleRef.get();
    if (!scheduleSnap.exists) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    const scheduleData = scheduleSnap.data();

    // 5. Validate batch matches
    if (studentData.batchId !== scheduleData.batchId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class batch' });
    }

    // 6. Check duplicate in attendanceLogs
    const logsQuery = await db.collection('attendanceLogs')
      .where('studentId', '==', studentId)
      .where('scheduleId', '==', scheduleId)
      .limit(1)
      .get();

    if (!logsQuery.empty) {
      return res.status(409).json({ success: false, message: 'Attendance already marked for this class' });
    }

    // 7. Add attendanceLogs document (Source of truth)
    const logData = {
      studentId,
      scheduleId,
      batchId: scheduleData.batchId,
      markedAt: new Date().toISOString()
    };
    await db.collection('attendanceLogs').add(logData);

    // 8. Update attendanceSessions (Summary)
    const sessionRef = db.collection('attendanceSessions').doc(scheduleId);
    
    // We use set with merge:true to ensure the document gets created if it doesn't exist
    await sessionRef.set({
      scheduleId,
      batchId: scheduleData.batchId,
      isActive: true,
      totalAttendanceCount: admin.firestore.FieldValue.increment(1),
      attendees: admin.firestore.FieldValue.arrayUnion(studentId)
    }, { merge: true });

    // 9. Update users currentAttendance (Cached value)
    await studentRef.update({
      currentAttendance: admin.firestore.FieldValue.increment(1)
    });

    return res.status(200).json({ success: true, message: 'Attendance marked successfully' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error marking attendance' });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentSnap = await db.collection('users').doc(studentId).get();
    if (!studentSnap.exists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const studentData = studentSnap.data();
    const attended = studentData.currentAttendance || 0;

    let total = 0;
    if (studentData.batchId) {
      const qs = await db.collection('schedules').where('batchId', '==', studentData.batchId).get();
      total = qs.size;
    }

    const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);

    return res.status(200).json({ 
      success: true, 
      data: { attended, total, percentage }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching student attendance' });
  }
};
