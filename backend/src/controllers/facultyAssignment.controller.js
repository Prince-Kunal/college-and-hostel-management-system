import { db } from '../firebase.js';

export const createAssignment = async (req, res) => {
  try {
    const { batchId, subjectId, facultyId } = req.body;
    
    if (!batchId || !subjectId || !facultyId) {
      return res.status(400).json({ success: false, message: 'Batch, Subject, and Faculty identifiers are required' });
    }

    // Prevent duplicate assignment
    const snapshot = await db.collection('facultyAssignments')
      .where('batchId', '==', batchId)
      .where('subjectId', '==', subjectId)
      .get();
    
    if (!snapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'A faculty member is already assigned to this subject for this batch' 
      });
    }

    const newAssignment = {
      batchId,
      subjectId,
      facultyId,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('facultyAssignments').add(newAssignment);
    
    return res.status(201).json({
      success: true,
      message: 'Faculty assigned successfully',
      data: { id: docRef.id, ...newAssignment }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error assigning faculty' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const snapshot = await db.collection('facultyAssignments').get();
    
    const assignments = [];
    snapshot.forEach(doc => {
      assignments.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching assignments' });
  }
};
