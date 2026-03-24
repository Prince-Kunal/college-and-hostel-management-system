import { db } from '../firebase.js';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export const createAssignment = async (req, res) => {
  try {
    const { batchId, subjectId, facultyId } = req.body;
    
    if (!batchId || !subjectId || !facultyId) {
      return res.status(400).json({ success: false, message: 'Batch, Subject, and Faculty specific identifiers are strictly required' });
    }

    const assignmentsRef = collection(db, 'facultyAssignments');
    
    // Prevent duplicate assignment per strict modular specification
    const q = query(
      assignmentsRef,
      where('batchId', '==', batchId),
      where('subjectId', '==', subjectId)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'A faculty member is securely already assigned strictly to this subject for this specific batch' 
      });
    }

    const newAssignment = {
      batchId,
      subjectId,
      facultyId,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(assignmentsRef, newAssignment);
    
    return res.status(201).json({
      success: true,
      message: 'Faculty assigned successfully mapped',
      data: { id: docRef.id, ...newAssignment }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Fatal logical error mapping subjects securely' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignmentsRef = collection(db, 'facultyAssignments');
    const snapshot = await getDocs(assignmentsRef);
    
    const assignments = [];
    snapshot.forEach(doc => {
      assignments.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error executing maps assignment' });
  }
};
