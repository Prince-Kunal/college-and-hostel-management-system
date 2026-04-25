import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const FacultyCreateSchedule = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]);

    const [batchId, setBatchId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [date, setDate] = useState('');
    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchDependencies(parsedUser.uid);
        }
    }, []);

    const fetchDependencies = async (facultyId) => {
        try {
            const [resB, resS, resA] = await Promise.all([
                fetch('http://localhost:8000/api/v1/batches'),
                fetch('http://localhost:8000/api/v1/subjects'),
                fetch('http://localhost:8000/api/v1/faculty-assignments')
            ]);
            
            const dbB = await resB.json();
            const dbS = await resS.json();
            const dbA = await resA.json();

            // Filter assignments for this specific faculty
            const assignmentsForMe = dbA.success ? dbA.data.filter(a => a.facultyId === facultyId) : [];
            setMyAssignments(assignmentsForMe);

            // Get unique batches assigned to me
            if (dbB.success) {
                const myBatchIds = new Set(assignmentsForMe.map(a => a.batchId));
                setBatches(dbB.data.filter(b => myBatchIds.has(b.id)));
            }

            if (dbS.success) {
                setSubjects(dbS.data);
            }
        } catch (err) {
            console.error('Failed fetching data:', err);
        }
    };

    // Filter available subjects based on selected batch
    const availableSubjects = subjects.filter(s => 
        myAssignments.some(a => a.batchId === batchId && a.subjectId === s.id)
    );

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!date) {
            setError('Please select a valid date.');
            setLoading(false);
            return;
        }

        if (startTime >= endTime) {
            setError('End time must be after start time.');
            setLoading(false);
            return;
        }

        try {
            const payload = { 
                batchId, 
                subjectId, 
                facultyId: user.uid, 
                date, 
                day, 
                startTime, 
                endTime 
            };

            await api.createSchedule(payload);

            setSuccess(true);
            setDate('');
            setDay('');
            setStartTime('');
            setEndTime('');
            setSubjectId('');
        } catch (err) {
            setError(err.message || 'Failed to create schedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Faculty Portal</p>
                    <h1>Schedule Class 📅</h1>
                    <span className="sub">Schedule a new class for your assigned batches</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/faculty/classes')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Back to Classes</button>
                </div>
            </header>

            <div className="sd-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Class Details</h3>
                
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        Class scheduled successfully!
                    </div>
                )}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select Batch</label>
                        <select 
                            value={batchId} 
                            onChange={(e) => { setBatchId(e.target.value); setSubjectId(''); }} 
                            required 
                            style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                        >
                            <option value="">-- Choose Batch --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select Subject</label>
                        <select 
                            value={subjectId} 
                            onChange={(e) => setSubjectId(e.target.value)} 
                            required 
                            disabled={!batchId}
                            style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: !batchId ? '#f1f5f9' : '#f8fafc', color: '#0f172a', outline: 'none' }}
                        >
                            <option value="">-- Choose Subject --</option>
                            {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Date</label>
                            <input 
                                type="date" 
                                required 
                                value={date} 
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    if (e.target.value) {
                                        const d = new Date(e.target.value);
                                        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
                                        setDay(dayName);
                                    } else {
                                        setDay('');
                                    }
                                }} 
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Day</label>
                            <input 
                                type="text" 
                                value={day} 
                                readOnly 
                                placeholder="Auto-calculated" 
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', outline: 'none' }} 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Start Time</label>
                            <input 
                                type="time" 
                                required 
                                value={startTime} 
                                onChange={(e) => setStartTime(e.target.value)} 
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>End Time</label>
                            <input 
                                type="time" 
                                required 
                                value={endTime} 
                                onChange={(e) => setEndTime(e.target.value)} 
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }} 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !batchId || !subjectId || !date || !day || !startTime || !endTime}
                        className="sd-btn-primary"
                        style={{ width: '100%', padding: '14px', marginTop: '8px', background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: (loading || !batchId || !subjectId || !date || !day || !startTime || !endTime) ? 'not-allowed' : 'pointer', opacity: (loading || !batchId || !subjectId || !date || !day || !startTime || !endTime) ? 0.6 : 1 }}
                    >
                        {loading ? 'Scheduling...' : 'Schedule Class'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FacultyCreateSchedule;
