import { db } from '../firebase.js';

export const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity, type } = req.body;

    if (!roomNumber || floor === undefined || !capacity || !type) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (![1, 2, 3].includes(capacity)) {
      return res.status(400).json({ success: false, message: 'Capacity must be 1, 2, or 3' });
    }

    if (!['boys', 'girls', 'faculty'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be boys, girls, or faculty' });
    }

    // Check if room already exists
    const existingRoom = await db.collection('rooms').where('roomNumber', '==', roomNumber).get();
    if (!existingRoom.empty) {
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }

    const newRoom = {
      roomNumber,
      floor: Number(floor),
      capacity: Number(capacity),
      type,
      occupants: [],
      occupantCount: 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('rooms').add(newRoom);

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { id: docRef.id, ...newRoom }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const allocateRoom = async (req, res) => {
  try {
    const { userId, roomId } = req.body;

    if (!userId || !roomId) {
      return res.status(400).json({ success: false, message: 'User ID and Room ID are required' });
    }

    const roomRef = db.collection('rooms').doc(roomId);
    const userRef = db.collection('users').doc(userId);
    const allocationsQuery = db.collection('allocations').where('userId', '==', userId).where('status', '==', 'active');

    await db.runTransaction(async (t) => {
      // 1. Read Room
      const roomDoc = await t.get(roomRef);
      if (!roomDoc.exists) {
        throw new Error('Room not found');
      }
      const room = roomDoc.data();

      // 2. Read User
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      const user = userDoc.data();

      // 3. Read existing allocations for user
      const existingAllocations = await t.get(allocationsQuery);
      if (!existingAllocations.empty) {
        throw new Error('User already has an active room allocation');
      }

      // 4. Validate Capacity
      if (room.occupantCount >= room.capacity) {
        throw new Error('Room is already at full capacity');
      }

      // 5. Validate Room Type Constraints
      const userRole = user.role || 'student';
      const userGender = user.gender || 'unknown';

      if (room.type === 'faculty' && userRole !== 'faculty') {
        throw new Error('This room is reserved for faculty members only');
      }
      if (room.type !== 'faculty' && userRole === 'faculty') {
        throw new Error('Faculty members cannot be allocated to student rooms');
      }
      if (room.type === 'boys' && userGender !== 'male') {
        throw new Error('This room is reserved for male students only');
      }
      if (room.type === 'girls' && userGender !== 'female') {
        throw new Error('This room is reserved for female students only');
      }

      // 6. Perform Updates
      const newAllocationRef = db.collection('allocations').doc();
      const newAllocation = {
        userId,
        roomId,
        role: userRole,
        status: 'active',
        allocatedAt: new Date().toISOString()
      };

      t.set(newAllocationRef, newAllocation);
      
      t.update(roomRef, {
        occupants: [...(room.occupants || []), userId],
        occupantCount: (room.occupantCount || 0) + 1
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Room allocated successfully'
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const snapshot = await db.collection('rooms').orderBy('floor').get();
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllocations = async (req, res) => {
  try {
    // We want to fetch all allocations, rooms, and users to structure them.
    const [allocsSnap, roomsSnap, usersSnap] = await Promise.all([
      db.collection('allocations').where('status', '==', 'active').get(),
      db.collection('rooms').get(),
      db.collection('users').get()
    ]);

    const usersMap = {};
    usersSnap.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });

    const roomsMap = {};
    roomsSnap.forEach(doc => {
      roomsMap[doc.id] = { id: doc.id, ...doc.data(), users: [] };
    });

    allocsSnap.forEach(doc => {
      const alloc = doc.data();
      if (roomsMap[alloc.roomId]) {
        roomsMap[alloc.roomId].users.push(usersMap[alloc.userId] || { name: 'Unknown User' });
      }
    });

    // Group by floor
    const grouped = {};
    Object.values(roomsMap).forEach(room => {
      const floorStr = `Floor ${room.floor}`;
      if (!grouped[floorStr]) {
        grouped[floorStr] = [];
      }
      grouped[floorStr].push(room);
    });

    // Sort rooms within each floor by room number
    for (const floor in grouped) {
      grouped[floor].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    }

    return res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Mess Menu ──

export const setMenu = async (req, res) => {
  try {
    const { date, meals, createdBy } = req.body;
    if (!date || !meals) {
      return res.status(400).json({ success: false, message: 'Date and meals are required' });
    }
    
    // Upsert menu for the specific date
    await db.collection('messMenus').doc(date).set({
      date,
      meals,
      createdBy: createdBy || 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({ success: true, message: 'Menu updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMenu = async (req, res) => {
  try {
    const { date } = req.params;
    const menuDoc = await db.collection('messMenus').doc(date).get();
    
    if (!menuDoc.exists) {
      return res.status(404).json({ success: false, message: 'Menu not found for this date' });
    }
    
    return res.status(200).json({ success: true, data: menuDoc.data() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Leave Management ──

export const applyLeave = async (req, res) => {
  try {
    const { userId, fromDate, toDate, reason } = req.body;
    if (!userId || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const leaveData = {
      userId,
      fromDate,
      toDate,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('leaveRequests').add(leaveData);
    return res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: { id: docRef.id, ...leaveData } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const { uid } = req.params;
    const snapshot = await db.collection('leaveRequests').where('userId', '==', uid).get();
    const leaves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort descending by createdAt
    leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const [leavesSnap, usersSnap] = await Promise.all([
      db.collection('leaveRequests').get(),
      db.collection('users').get()
    ]);

    const usersMap = {};
    usersSnap.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });

    const leaves = leavesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        user: usersMap[data.userId] || { name: 'Unknown User', email: '' }
      };
    });

    leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await db.collection('leaveRequests').doc(id).update({ status });
    return res.status(200).json({ success: true, message: 'Leave status updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveLeaves = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Fetch all approved leaves
    const snapshot = await db.collection('leaveRequests')
      .where('status', '==', 'approved')
      .get();
      
    // Manually filter for leaves active today (toDate >= today && fromDate <= today)
    const activeLeaves = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.toDate >= today && data.fromDate <= today) {
        activeLeaves.push({ id: doc.id, ...data });
      }
    });

    // Hydrate with user details
    const userIds = [...new Set(activeLeaves.map(l => l.userId))];
    const usersMap = {};
    if (userIds.length > 0) {
        // Handle firestore 'in' query limits (max 10) by fetching all users or chunking.
        // For simplicity in a small app, we can fetch all users:
        const usersSnap = await db.collection('users').get();
        usersSnap.forEach(doc => {
            usersMap[doc.id] = doc.data();
        });
    }

    const populatedLeaves = activeLeaves.map(l => ({
        ...l,
        user: usersMap[l.userId] || { name: 'Unknown' }
    }));

    return res.status(200).json({ success: true, data: populatedLeaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Complaints Management ──

export const submitComplaint = async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    if (!userId || !title || !description) {
      return res.status(400).json({ success: false, message: 'User ID, title, and description are required' });
    }

    const complaintData = {
      userId,
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('complaints').add(complaintData);
    return res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: { id: docRef.id, ...complaintData } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const { uid } = req.params;
    const snapshot = await db.collection('complaints').where('userId', '==', uid).get();
    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const [complaintsSnap, usersSnap] = await Promise.all([
      db.collection('complaints').get(),
      db.collection('users').get()
    ]);

    const usersMap = {};
    usersSnap.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });

    const complaints = complaintsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        user: usersMap[data.userId] || { name: 'Unknown User', email: '' }
      };
    });

    complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('complaints').doc(id).update({ 
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    });
    return res.status(200).json({ success: true, message: 'Complaint resolved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
