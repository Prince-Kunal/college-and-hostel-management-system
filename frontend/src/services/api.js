
const API = import.meta.env.VITE_API_BASE_URL;

const BASE_URL = `${API}`;

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            if (user.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }
        } catch (e) {}
    }
    return headers;
};

export const api = {
    // ── Student ──
    getStudentProfile: async (uid) => {
        const response = await fetch(`${BASE_URL}/student/${uid}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();
        return data.data;
    },

    createSchedule: async (scheduleData) => {
        const response = await fetch(`${BASE_URL}/schedules`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(scheduleData)
        });
        if (!response.ok) throw new Error('Failed to create schedule');
        return await response.json();
    },

    getStudentSchedules: async (uid) => {
        const response = await fetch(`${BASE_URL}/schedules/student/${uid}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch schedule data');
        const data = await response.json();
        return data.data;
    },

    onboardStudent: async (uid, onboardingData) => {
        const response = await fetch(`${BASE_URL}/student/${uid}/onboarding`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(onboardingData)
        });
        if (!response.ok) throw new Error('Failed to submit onboarding');
        return await response.json();
    },

    // ── Faculty ──
    getFacultySchedules: async (facultyId) => {
        const response = await fetch(`${BASE_URL}/schedules/faculty/${facultyId}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch faculty schedules');
        const data = await response.json();
        return data.data;
    },

    // ── LiveKit ──
    startLiveClass: async (scheduleId, facultyId) => {
        const response = await fetch(`${BASE_URL}/live/start`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ scheduleId, facultyId })
        });
        if (!response.ok) throw new Error('Failed to start live class');
        return await response.json();
    },

    joinLiveClass: async (scheduleId, studentId) => {
        const response = await fetch(`${BASE_URL}/live/join/${scheduleId}?studentId=${studentId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to join live class');
        return await response.json();
    },

    // ── Events ──
    createEvent: async (eventData) => {
        const response = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error('Failed to create event');
        return await response.json();
    },

    getEvents: async () => {
        const response = await fetch(`${BASE_URL}/events`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        return data.data;
    },

    enrollEvent: async (eventId, userData) => {
        const response = await fetch(`${BASE_URL}/events/${eventId}/enroll`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        return data;
    },

    getMyEnrollments: async (uid) => {
        const response = await fetch(`${BASE_URL}/events/my/${uid}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch enrollments');
        const data = await response.json();
        return data.data;
    },

    // ── Attendance ──
    generateQRToken: async (scheduleId) => {
        const response = await fetch(`${BASE_URL}/attendance/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ scheduleId })
        });
        if (!response.ok) throw new Error('Failed to generate QR token');
        return await response.json();
    },

    markAttendance: async (token, studentId) => {
        const response = await fetch(`${BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ token, studentId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to mark attendance');
        return data;
    },

    getStudentAttendance: async (studentId) => {
        const response = await fetch(`${BASE_URL}/attendance/student/${studentId}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch student attendance');
        const data = await response.json();
        return data.data;
    },

    // ── Notifications ──
    createNotification: async (notificationData) => {
        const response = await fetch(`${BASE_URL}/notifications`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(notificationData)
        });
        if (!response.ok) throw new Error('Failed to send notification');
        return await response.json();
    },

    getNotifications: async (uid) => {
        const response = await fetch(`${BASE_URL}/notifications/${uid}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        return data.data;
    },

    markNotificationRead: async (notificationId, uid) => {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ uid })
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return await response.json();
    }
};
