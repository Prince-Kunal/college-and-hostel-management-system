import React, { useState, useEffect } from 'react';

const CreateSchedule = () => {
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
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f0f8ff', border: '1px solid #cce5ff', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Create Class Schedule Block</h2>
                {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{error}</p>}
                {success && <p style={{ color: '#198754', fontWeight: 'bold' }}>Schedule uniquely block pushed specifically!</p>}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Core Batch Node</label>
                        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Dropdown Target Batch --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Attached Subject Tuple</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Allocate Academic Subject --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Target Faculty Allocation (Override Auto-fill)</label>
                        <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Enforce Null Override Pattern --</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.email}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Date</label>
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
                            style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                        />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Auto-Calculated Day</label>
                        <input type="text" value={day} readOnly placeholder="Select a date first" style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f8f9fa', color: '#6c757d' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Start Time Metric</label>
                            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>End Time Block</label>
                            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !batchId || !subjectId || !date || !day || !startTime || !endTime}
                        style={{ padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: (loading || !batchId || !subjectId || !date || !day || !startTime || !endTime) ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Initializing Block...' : 'Publish New Schedule Tuple'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSchedule;
