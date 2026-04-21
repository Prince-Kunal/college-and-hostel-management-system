import { db } from '../firebase.js';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

export const getUsers = async (req, res) => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.role !== 'deleted') {
        users.push({
          id: doc.id,
          email: data.email,
          role: data.role
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while fetching users'
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, { role });

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while updating user role'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, { role: 'deleted' });

    return res.status(200).json({
      success: true,
      message: 'User successfully disabled'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while deleting user'
    });
  }
};

export const getBatchesDetails = async (req, res) => {
  try {
    // 1. Fetch all batches
    const batchesSnapshot = await getDocs(collection(db, 'batches'));
    const batches = [];
    batchesSnapshot.forEach(doc => {
      batches.push({ id: doc.id, ...doc.data() });
    });

    // 2. Fetch all required entities to avoid N+1 queries and index issues
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const assignmentsSnapshot = await getDocs(collection(db, 'facultyAssignments'));
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));

    const allUsers = [];
    usersSnapshot.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));

    const allAssignments = [];
    assignmentsSnapshot.forEach(doc => allAssignments.push({ id: doc.id, ...doc.data() }));

    const subjectsMap = {};
    subjectsSnapshot.forEach(doc => {
      subjectsMap[doc.id] = doc.data().name;
    });

    const detailedBatches = batches.map(batch => {
      // Find students for this batch
      const students = allUsers
        .filter(u => u.role === 'student' && u.batchId === batch.id)
        .map(u => ({ uid: u.id, email: u.email }));

      // Find assignments for this batch
      const batchAssignments = allAssignments.filter(a => a.batchId === batch.id);
      
      const assignments = batchAssignments.map(assignment => {
        const faculty = allUsers.find(u => u.id === assignment.facultyId);
        return {
          subjectName: subjectsMap[assignment.subjectId] || 'Unknown Subject',
          facultyName: faculty ? faculty.email : 'Unknown Faculty' // Using email as name isn't there
        };
      });

      return {
        batchId: batch.id,
        batchName: batch.name,
        students,
        assignments
      };
    });

    return res.status(200).json({
      success: true,
      data: detailedBatches
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while fetching batches details'
    });
  }
};
