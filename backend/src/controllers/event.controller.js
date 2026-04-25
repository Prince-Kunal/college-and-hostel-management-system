import { db } from '../firebase.js';

export const createEvent = async (req, res) => {
  try {
    const { name, time, location, description, capacity, audience } = req.body;

    if (!name || !time || !location || !description || !capacity || !audience) {
      return res.status(400).json({ success: false, message: 'All event fields are required' });
    }

    if (!['student', 'faculty', 'both'].includes(audience)) {
      return res.status(400).json({ success: false, message: 'Audience must be student, faculty, or both' });
    }

    const newEvent = {
      name,
      time,
      location,
      description,
      capacity: Number(capacity),
      audience,
      enrolledCount: 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('events').add(newEvent);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { id: docRef.id, ...newEvent }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating event' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events').orderBy('time', 'asc').get();

    const events = [];
    for (const doc of snapshot.docs) {
      const eventData = { id: doc.id, ...doc.data() };

      // Get enrollment count
      const enrollSnap = await db.collection('events').doc(doc.id)
        .collection('enrollments').get();
      eventData.enrolledCount = enrollSnap.size;

      // Get waitlist count
      const waitlistSnap = await db.collection('events').doc(doc.id)
        .collection('waitlist').get();
      eventData.waitlistCount = waitlistSnap.size;

      events.push(eventData);
    }

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching events' });
  }
};

export const enrollEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, email, role } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'User uid and email are required' });
    }

    const eventRef = db.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const eventData = eventSnap.data();

    // Check audience eligibility
    if (eventData.audience !== 'both' && eventData.audience !== role) {
      return res.status(403).json({ success: false, message: 'You are not eligible for this event' });
    }

    // Check if already enrolled
    const existingEnroll = await eventRef.collection('enrollments').doc(uid).get();
    if (existingEnroll.exists) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }

    // Check if already on waitlist
    const existingWaitlist = await eventRef.collection('waitlist').doc(uid).get();
    if (existingWaitlist.exists) {
      return res.status(400).json({ success: false, message: 'Already on waitlist' });
    }

    // Count current enrollments
    const enrollSnap = await eventRef.collection('enrollments').get();
    const currentCount = enrollSnap.size;

    if (currentCount < eventData.capacity) {
      // Enroll directly
      await eventRef.collection('enrollments').doc(uid).set({
        uid,
        email,
        role: role || 'student',
        enrolledAt: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully enrolled',
        data: { status: 'enrolled' }
      });
    } else {
      // Add to waitlist
      await eventRef.collection('waitlist').doc(uid).set({
        uid,
        email,
        role: role || 'student',
        addedAt: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        message: 'Event is full. Added to waitlist.',
        data: { status: 'waitlisted' }
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error enrolling in event' });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const { uid } = req.params;

    const eventsSnap = await db.collection('events').get();
    const myEvents = [];

    for (const doc of eventsSnap.docs) {
      const enrollDoc = await db.collection('events').doc(doc.id)
        .collection('enrollments').doc(uid).get();
      const waitlistDoc = await db.collection('events').doc(doc.id)
        .collection('waitlist').doc(uid).get();

      if (enrollDoc.exists) {
        myEvents.push({ eventId: doc.id, status: 'enrolled', ...doc.data() });
      } else if (waitlistDoc.exists) {
        myEvents.push({ eventId: doc.id, status: 'waitlisted', ...doc.data() });
      }
    }

    return res.status(200).json({ success: true, data: myEvents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error fetching enrollments' });
  }
};
