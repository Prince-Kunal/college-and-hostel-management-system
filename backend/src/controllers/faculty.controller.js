import { db } from '../firebase.js';

export const getMyStudents = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // 1. Fetch facultyAssignments where facultyId matches
    const assignmentsSnapshot = await db.collection('facultyAssignments')
      .where('facultyId', '==', facultyId)
      .get();

    const batchIds = new Set();
    assignmentsSnapshot.forEach(doc => {
      batchIds.add(doc.data().batchId);
    });

    if (batchIds.size === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Fetch batches to map names and users to find students
    const batchesSnapshot = await db.collection('batches').get();
    const batchesMap = {};
    batchesSnapshot.forEach(doc => {
      batchesMap[doc.id] = doc.data().name;
    });

    const usersSnapshot = await db.collection('users').get();
    const allUsers = [];
    usersSnapshot.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));

    const uniqueBatchIds = Array.from(batchIds);
    
    const result = uniqueBatchIds.map(batchId => {
      const students = allUsers
        .filter(u => u.role === 'student' && u.batchId === batchId)
        .map(u => ({ uid: u.id, email: u.email }));

      return {
        batchId,
        batchName: batchesMap[batchId] || 'Unknown Batch',
        students
      };
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while fetching students'
    });
  }
};
