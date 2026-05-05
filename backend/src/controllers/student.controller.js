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

    // Fetch hostel allocation if any
    try {
        const allocSnap = await db.collection('allocations')
            .where('userId', '==', uid)
            .where('status', '==', 'active')
            .get();
            
        if (!allocSnap.empty) {
            const allocData = allocSnap.docs[0].data();
            const roomSnap = await db.collection('rooms').doc(allocData.roomId).get();
            if (roomSnap.exists) {
                userData.hostelRoom = roomSnap.data().roomNumber;
                userData.hostelFloor = roomSnap.data().floor;
            }
        }
    } catch(e) {
        console.warn("Could not fetch hostel allocation:", e.message);
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

export const updateStudentProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, dob, phone, gender, address } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'User UID is required' });
    }

    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Prepare update object
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (dob !== undefined) updates.dob = dob;
    if (phone !== undefined) updates.phone = phone;
    if (gender !== undefined) updates.gender = gender;
    if (address !== undefined) updates.address = address;

    if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        await userRef.update(updates);
    }

    return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { ...userSnap.data(), ...updates }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating student profile.'
    });
  }
};

export const onboardStudent = async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, dob, phone, gender } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'User UID is required for onboarding' });
    }
    
    if (!name || !dob || !phone || !gender) {
        return res.status(400).json({ success: false, message: 'Name, DOB, Phone number, and Gender are required' });
    }

    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      // Document exists, update it
      await userRef.update({
        name,
        dob,
        phone,
        gender,
        onboarded: true
      });
    } else {
      // Document doesn't exist (signup failed to write), create it
      await userRef.set({
        uid,
        name,
        dob,
        phone,
        gender,
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
