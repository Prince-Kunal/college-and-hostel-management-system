import { db } from '../firebase.js';

export const getStudentProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'User UID is required' });
    }

    const userSnap = await db.collection('users').doc(uid).get();

    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'User profile not found in database.' });
    }

    const userData = userSnap.data();

    if (userData.batchId) {
        try {
            const batchSnap = await db.collection('batches').doc(userData.batchId).get();
            if (batchSnap.exists) {
                userData.batchName = batchSnap.data().name;
            }
        } catch(e) {
            console.warn("Could not fetch batch for naming:", e.message);
        }
    }

    return res.status(200).json({
      success: true,
      message: 'Student profile fetched successfully',
      data: userData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred fetching student profile.'
    });
  }
};

export const onboardStudent = async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, dob, phone } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'User UID is required for onboarding' });
    }
    
    if (!name || !dob || !phone) {
        return res.status(400).json({ success: false, message: 'Name, DOB, and Phone number are required' });
    }

    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      // Document exists, update it
      await userRef.update({
        name,
        dob,
        phone,
        onboarded: true
      });
    } else {
      // Document doesn't exist (signup failed to write), create it
      await userRef.set({
        uid,
        name,
        dob,
        phone,
        role: 'student',
        onboarded: true,
        createdAt: new Date().toISOString()
      });
    }

    return res.status(200).json({
        success: true,
        message: 'Profile onboarding completed successfully.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating student record during onboarding.'
    });
  }
};
