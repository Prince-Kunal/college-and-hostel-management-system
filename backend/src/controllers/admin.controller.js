import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';

export const getUsers = async (req, res) => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        role: data.role
      });
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
