
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

    updateStudentProfile: async (uid, profileData) => {
        const response = await fetch(`${BASE_URL}/student/${uid}/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update student profile');
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
    },

    // ── Hostel ──
    getRooms: async () => {
        const response = await fetch(`${BASE_URL}/hostel/rooms`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const data = await response.json();
        return data.data;
    },

    createRoom: async (roomData) => {
        const response = await fetch(`${BASE_URL}/hostel/rooms`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(roomData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create room');
        return data.data;
    },

    getAllocations: async () => {
        const response = await fetch(`${BASE_URL}/hostel/allocations`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch allocations');
        const data = await response.json();
        return data.data; // this will be the grouped object
    },

    allocateRoom: async (allocationData) => {
        const response = await fetch(`${BASE_URL}/hostel/allocations`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(allocationData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to allocate room');
        return data;
    },

    // ── Mess Menu ──
    getMenu: async (date) => {
        const response = await fetch(`${BASE_URL}/hostel/menu/${date}`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok && response.status !== 404) throw new Error(data.message || 'Failed to fetch menu');
        return data.data || null; // Return null if 404 (not found)
    },

    setMenu: async (menuData) => {
        const response = await fetch(`${BASE_URL}/hostel/menu`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(menuData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update menu');
        return data;
    },

    // ── Leave Management ──
    applyLeave: async (leaveData) => {
        const response = await fetch(`${BASE_URL}/hostel/leave`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(leaveData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to apply for leave');
        return data.data;
    },

    getMyLeaves: async (uid) => {
        const response = await fetch(`${BASE_URL}/hostel/leave/student/${uid}`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch leaves');
        return data.data;
    },

    getAllLeaves: async () => {
        const response = await fetch(`${BASE_URL}/hostel/leave/admin`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch all leaves');
        return data.data;
    },

    updateLeaveStatus: async (id, status) => {
        const response = await fetch(`${BASE_URL}/hostel/leave/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update leave status');
        return data;
    },

    getActiveLeaves: async () => {
        const response = await fetch(`${BASE_URL}/hostel/leave/active`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch active leaves');
        return data.data;
    },

    // ── Complaints ──
    submitComplaint: async (complaintData) => {
        const response = await fetch(`${BASE_URL}/hostel/complaints`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(complaintData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit complaint');
        return data.data;
    },

    getMyComplaints: async (uid) => {
        const response = await fetch(`${BASE_URL}/hostel/complaints/student/${uid}`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch complaints');
        return data.data;
    },

    getAllComplaints: async () => {
        const response = await fetch(`${BASE_URL}/hostel/complaints/admin`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch all complaints');
        return data.data;
    },

    resolveComplaint: async (id) => {
        const response = await fetch(`${BASE_URL}/hostel/complaints/${id}/resolve`, {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to resolve complaint');
        return data;
    },

    // Admin helper
    getUsers: async () => {
        const response = await fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        return data.data;
    }
};
