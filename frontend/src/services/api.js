const BASE_URL = 'http://localhost:8000/api/v1';

// Helper to include auth token if one exists (from user state or local storage)
const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            if (user.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }
        } catch (e) {
            // Ignore parse error
        }
    }
    return headers;
};

export const api = {
    getStudentProfile: async (uid) => {
        try {
            const response = await fetch(`${BASE_URL}/student/${uid}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch student data');
            const data = await response.json();
            return data.data; // Since server wraps in { success, message, data }
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    
    getStudentSchedules: async (uid) => {
        try {
            // Re-using the pre-existing logic beautifully bound to scheduling dynamically via UUID mapping natively securely! 
            const response = await fetch(`${BASE_URL}/schedules/student/${uid}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch classes data uniquely bounded automatically inherently!');
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    onboardStudent: async (uid, onboardingData) => {
        try {
            const response = await fetch(`${BASE_URL}/student/${uid}/onboarding`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(onboardingData)
            });
            if (!response.ok) throw new Error('Failed to submit onboarding uniquely');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};
