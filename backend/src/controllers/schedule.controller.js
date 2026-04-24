import { db } from '../firebase.js';

export const createSchedule = async (req, res) => {
  try {
    const { batchId, subjectId, facultyId, day, startTime, endTime } = req.body;

    if (!batchId || !subjectId || !facultyId || !day || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required schedule parameters' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // Verify the faculty assignment exists
    const snapshot = await db.collection('facultyAssignments')
      .where('batchId', '==', batchId)
      .where('subjectId', '==', subjectId)
      .where('facultyId', '==', facultyId)
      .get();
    
    if (snapshot.empty) {
      return res.status(403).json({ 
        success: false, 
        message: 'Faculty is not assigned to this subject for this batch' 
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

    const docRef = await db.collection('schedules').add(newSchedule);

    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: { id: docRef.id, ...newSchedule }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating schedule' });
  }
};

export const getSchedules = async (req, res) => {
  try {
    const snapshot = await db.collection('schedules').get();
    
    const schedules = [];
    snapshot.forEach(doc => {
      schedules.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching schedules' });
  }
};

export const getStudentSchedules = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const userSnap = await db.collection('users').doc(studentId).get();
    
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const userData = userSnap.data();
    const batchId = userData.batchId;
    
    if (!batchId) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    const qs = await db.collection('schedules')
      .where('batchId', '==', batchId)
      .get();
    
    const schedules = [];
    for (const d of qs.docs) {
        let data = d.data();
        let subjectName = "Unknown Subject";
        let facultyName = data.facultyId;

        try {
            const subjSnap = await db.collection('subjects').doc(data.subjectId).get();
            if (subjSnap.exists && subjSnap.data().name) {
                subjectName = subjSnap.data().name;
            }
        } catch(e) {}

        try {
            const facSnap = await db.collection('users').doc(data.facultyId).get();
            if (facSnap.exists && facSnap.data().name) {
                facultyName = facSnap.data().name;
            }
        } catch(e) {}

        schedules.push({ id: d.id, ...data, subjectName, facultyName });
    }
    
    return res.status(200).json({ success: true, data: schedules });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching student schedules' });
  }
};

export const getFacultySchedules = async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    const qs = await db.collection('schedules')
      .where('facultyId', '==', facultyId)
      .get();
    
    const schedules = [];
    qs.forEach(d => {
      schedules.push({ id: d.id, ...d.data() });
    });
    
    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching faculty schedules' });
  }
};
