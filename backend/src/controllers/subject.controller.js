import { db } from '../firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Subject name is required' });

    const newSubject = {
      name,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'subjects'), newSubject);
    
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { id: docRef.id, ...newSubject }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error occurred while creating subject' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const snapshot = await getDocs(subjectsRef);
    
    const subjects = [];
    snapshot.forEach(doc => {
      subjects.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching subjects' });
  }
};
