import { db } from '../firebase.js';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

export const createBatch = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Batch name is required' });
    }

    const newBatch = {
      name,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'batches'), newBatch);
    
    return res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: { id: docRef.id, ...newBatch }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error occurred while creating batch' });
  }
};

export const getBatches = async (req, res) => {
  try {
    const batchesRef = collection(db, 'batches');
    const snapshot = await getDocs(batchesRef);
    
    const batches = [];
    snapshot.forEach(doc => {
      batches.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: batches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching batches' });
  }
};

export const assignStudent = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, { batchId });

    return res.status(200).json({ 
      success: true, 
      message: 'Student successfully assigned to batch' 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error assigning student' });
  }
};
