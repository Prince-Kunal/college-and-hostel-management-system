import { AccessToken } from 'livekit-server-sdk';
import { db } from '../firebase.js';

const createToken = async (roomName, identity, role) => {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        throw new Error("LiveKit API keys missing");
    }
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    const at = new AccessToken(apiKey, apiSecret, {
        identity: identity,
    });
    
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });
    
    const token = await at.toJwt();
    return typeof token === "string" ? token : String(token);
};

export const startLiveClass = async (req, res) => {
    try {
        const { scheduleId, facultyId } = req.body;
        if (!scheduleId || !facultyId) {
            return res.status(400).json({ success: false, message: 'scheduleId and facultyId are required' });
        }
        
        const querySnapshot = await db.collection('liveClasses')
            .where('scheduleId', '==', scheduleId)
            .where('isActive', '==', true)
            .get();
        
        if (!querySnapshot.empty) {
            const activeClassDoc = querySnapshot.docs[0];
            const { roomName } = activeClassDoc.data();
            const token = await createToken(roomName, facultyId, 'host');
            return res.status(200).json({ success: true, roomName, token });
        }
        
        const roomName = `room-${scheduleId}`;
        
        const liveClassData = {
            scheduleId,
            roomName,
            facultyId,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        await db.collection('liveClasses').add(liveClassData);
        
        const token = await createToken(roomName, facultyId, 'host');
        
        res.status(200).json({ success: true, roomName, token });
    } catch (error) {
        console.error('Error starting live class:', error);
        res.status(500).json({ success: false, message: 'Failed to start live class' });
    }
};

export const joinLiveClass = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const studentId = req.query.studentId || `student-${Date.now()}`;
        
        const querySnapshot = await db.collection('liveClasses')
            .where('scheduleId', '==', scheduleId)
            .where('isActive', '==', true)
            .get();
        
        if (querySnapshot.empty) {
            return res.status(404).json({ success: false, message: 'No active live class found for this schedule' });
        }
        
        const activeClassDoc = querySnapshot.docs[0];
        const { roomName } = activeClassDoc.data();
        
        const token = await createToken(roomName, studentId, 'participant');
        
        res.status(200).json({ success: true, roomName, token });
    } catch (error) {
        console.error('Error joining live class:', error);
        res.status(500).json({ success: false, message: 'Failed to join live class' });
    }
};
