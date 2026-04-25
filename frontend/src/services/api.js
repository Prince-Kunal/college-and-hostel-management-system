const BASE_URL = 'http://localhost:8000/api/v1';

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
};
