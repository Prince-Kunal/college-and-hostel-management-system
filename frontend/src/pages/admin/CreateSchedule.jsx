import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateSchedule = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [batchId, setBatchId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [date, setDate] = useState('');
    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchDependencies();
    }, []);

    const fetchDependencies = async () => {
        try {
            const [resB, resS, resU, resA] = await Promise.all([
                fetch(`http://${window.location.hostname}:8000/api/v1/batches`),
                fetch(`http://${window.location.hostname}:8000/api/v1/subjects`),
                fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`),
                fetch(`http://${window.location.hostname}:8000/api/v1/faculty-assignments`)
            ]);
            
            const dbB = await resB.json();
            const dbS = await resS.json();
            const dbU = await resU.json();
            const dbA = await resA.json();

            if (dbB.success) setBatches(dbB.data);
            if (dbS.success) setSubjects(dbS.data);
            if (dbA.success) setAssignments(dbA.data);
            if (dbU.success) setFaculties(dbU.data.filter(u => u.role === 'faculty'));
        } catch (err) {
            console.error('Failed fetching remote schema allocations:', err);
        }
    };

    // Auto-fill faculty logic
    useEffect(() => {
        if (batchId && subjectId) {
            const assignment = assignments.find(a => a.batchId === batchId && a.subjectId === subjectId);
            if (assignment) {
                setFacultyId(assignment.facultyId);
            } else {
                setFacultyId(''); // Clear cleanly if natively absent mapping
            }
        }
    }, [batchId, subjectId, assignments]);

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
            setError('Time logic invalid: End time must strictly proceed start time explicitly.');
            setLoading(false);
            return;
        }

        try {
            const payload = { batchId, subjectId, date, day, startTime, endTime };
            if (facultyId) payload.facultyId = facultyId;

            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error storing unique scheduling tuple');

            setSuccess(true);
            setDate('');
            setDay('');
            setStartTime('');
            setEndTime('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Portal</p>
                    <h1>Create Class Schedule 📅</h1>
                    <span className="sub">Schedule new classes and allocate faculty</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/schedules')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Back to Schedules</button>
                </div>
            </header>

            <div className="sd-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Schedule Details</h3>
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        Schedule block successfully created!
                    </div>
                )}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Core Batch Node</label>
                        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                            <option value="">-- Dropdown Target Batch --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Attached Subject Tuple</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                            <option value="">-- Allocate Academic Subject --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Target Faculty Allocation (Override Auto-fill)</label>
                        <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                            <option value="">-- Enforce Null Override Pattern --</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.email}</option>)}
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
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Auto-Calculated Day</label>
                            <input type="text" value={day} readOnly placeholder="Select a date first" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', outline: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Start Time Metric</label>
                            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>End Time Block</label>
                            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !batchId || !subjectId || !date || !day || !startTime || !endTime}
                        className="sd-btn-primary"
                        style={{ padding: '14px', marginTop: '8px', background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: (loading || !batchId || !subjectId || !date || !day || !startTime || !endTime) ? 'not-allowed' : 'pointer', opacity: (loading || !batchId || !subjectId || !date || !day || !startTime || !endTime) ? 0.6 : 1 }}
                    >
                        {loading ? 'Initializing Block...' : 'Publish New Schedule Tuple'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSchedule;
