import { db } from '../firebase.js';
import admin from 'firebase-admin';

export const createNotification = async (req, res) => {
  try {
    const { title, message, targetRole, targetBatches, createdBy } = req.body;

    if (!title || !message || !targetRole) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const notificationData = {
      title,
      message,
      targetRole, // 'all', 'student', 'faculty'
      targetBatches: targetBatches || [], // array of batch IDs
      createdBy: createdBy || 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('notifications').add(notificationData);

    return res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: { id: docRef.id, ...notificationData }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { uid } = req.params;

    // 1. Fetch the user to get role, batchId, and read array
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userData = userSnap.data();
    const role = userData.role;
    const batchId = userData.batchId; // applicable if student
    const assignedBatches = userData.assignedBatches || []; // applicable if faculty (might need to fetch from facultyAssignments if we don't store directly on user, let's fetch from facultyAssignments)
    const readNotifications = userData.readNotifications || [];

    let facultyBatchIds = [];
    if (role === 'faculty') {
        const assignmentsSnap = await db.collection('facultyAssignments').where('facultyId', '==', uid).get();
        assignmentsSnap.forEach(doc => {
            facultyBatchIds.push(doc.data().batchId);
        });
    }

    // 2. Fetch notifications
    // We fetch all notifications and filter in memory since firestore OR queries with array-contains are limited.
    // For a production app with huge notification volume, this would need optimization, but for university it's fine.
    // Alternatively, fetch where targetRole == role OR targetRole == 'all'
    const notificationsSnap = await db.collection('notifications').orderBy('createdAt', 'desc').get();
    
    let relevantNotifications = [];

    notificationsSnap.forEach(doc => {
      const notif = doc.data();
      const id = doc.id;

      let isRelevant = false;

      if (role === 'admin') {
          isRelevant = true;
      } else if (role === 'student') {
          if (notif.targetRole === 'all' || notif.targetRole === 'student') {
              if (!notif.targetBatches || notif.targetBatches.length === 0) {
                  isRelevant = true; // sent to all students
              } else if (batchId && notif.targetBatches.includes(batchId)) {
                  isRelevant = true; // sent to this specific batch
              }
          }
      } else if (role === 'faculty') {
          if (notif.targetRole === 'all' || notif.targetRole === 'faculty') {
              if (!notif.targetBatches || notif.targetBatches.length === 0) {
                  isRelevant = true; // sent to all faculty
              } else if (facultyBatchIds.some(bid => notif.targetBatches.includes(bid))) {
                  isRelevant = true; // sent to a batch this faculty teaches
              }
          }
      }

      if (isRelevant) {
          relevantNotifications.push({
              id,
              ...notif,
              isRead: readNotifications.includes(id),
              // Firestore Timestamp to string
              createdAt: notif.createdAt ? notif.createdAt.toDate().toISOString() : new Date().toISOString()
          });
      }
    });

    return res.status(200).json({
      success: true,
      data: relevantNotifications
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await db.collection('users').doc(uid).update({
        readNotifications: admin.firestore.FieldValue.arrayUnion(id)
    });

    return res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
