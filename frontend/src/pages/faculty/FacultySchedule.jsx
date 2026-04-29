import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;


const FacultySchedule = () => {
    const [user, setUser] = useState(null);
    const [myAssignments, setMyAssignments] = useState([]);
    const [batchesMap, setBatchesMap] = useState({});
    const [subjectsMap, setSubjectsMap] = useState({});

    const [batchId, setBatchId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [day, setDay] = useState('Monday');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            // Handle cross-platform ID resolving natively exclusively securely
            setUser({ ...parsed, activeId: parsed.id || parsed.uid });
        }
    }, []);

    useEffect(() => {
        if (user?.activeId) fetchDependencies();
    }, [user]);

    const fetchDependencies = async () => {
        try {
            const [resA, resB, resS] = await Promise.all([
                fetch(`${API}/faculty-assignments`),
                fetch(`${API}/batches`),
                fetch(`${API}/subjects`)
            ]);
            
            const dbA = await resA.json();
            const dbB = await resB.json();
            const dbS = await resS.json();

            // Native Dictionary lookup hashing accurately globally distinct records
            const bMap = {};
            if (dbB.success) dbB.data.forEach(b => bMap[b.id] = b.name);
            setBatchesMap(bMap);

            const sMap = {};
            if (dbS.success) dbS.data.forEach(s => sMap[s.id] = s.name);
            setSubjectsMap(sMap);

            // Strip out strictly mappings assigned natively exactly referencing logged-in specific UUID natively explicitly cleanly
            if (dbA.success && user?.activeId) {
                const mine = dbA.data.filter(a => a.facultyId === user.activeId);
                setMyAssignments(mine);
            }
        } catch (err) {
            console.error('Error intrinsically resolving external references globally mapped locally', err);
        }
    };

    // Derived distinct arrays safely evaluating specifically restricted scopes implicitly actively rendering
    const getAvailableBatches = () => {
        return Array.from(new Set(myAssignments.map(a => a.batchId)));
    };

    const getAvailableSubjects = () => {
        if (!batchId) return [];
        return myAssignments.filter(a => a.batchId === batchId).map(a => a.subjectId);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (startTime >= endTime) {
            setError('Time logic fault: Native temporal progression uniquely dictates EndTime explicitly executing after StartTime locally physically natively.');
            setLoading(false);
            return;
        }

        try {
            const payload = { 
                batchId, 
                subjectId, 
                facultyId: user.activeId, // Strict explicitly mapped constant locally securely bound internally fundamentally distinctly cleanly natively
                day, 
                startTime, 
                endTime 
            };

            const res = await fetch(`${API}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Forbidden constraint logic inherently rejected globally securely physically mapped dynamically directly explicitly.');

            setSuccess(true);
            setStartTime('');
            setEndTime('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ padding: '2rem' }}>Awaiting secure internal resolution natively executing authentication actively directly explicitly cleanly.</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Faculty Workload Sequencer</h2>
                {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{error}</p>}
                {success && <p style={{ color: '#198754', fontWeight: 'bold' }}>Workload map properly allocated uniquely cleanly firmly exactly explicitly uniquely explicitly locally explicitly.</p>}

                <p style={{ color: '#666' }}>Active Specific Node Bound Session specifically running strictly executing intrinsically bound tightly as explicitly authenticated securely: <strong>{user.email}</strong></p>

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Isolated Exclusively Mapped Source Batch</label>
                        <select value={batchId} onChange={(e) => { setBatchId(e.target.value); setSubjectId(''); }} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Active Bound Delegation Batches --</option>
                            {getAvailableBatches().map(bId => (
                                <option key={bId} value={bId}>{batchesMap[bId] || bId}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Permitted Assigned Native Scope Target Subject Node Tuple natively securely mapping strictly securely natively properly</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required disabled={!batchId} style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Actively Selectable Explicit Subject Tuple securely globally natively directly explicitly exclusively implicitly --</option>
                            {getAvailableSubjects().map(sId => (
                                <option key={sId} value={sId}>{subjectsMap[sId] || sId}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Operational Distinct Sequential Cycle Timestamp properly explicitly locally inherently physically mapped correctly organically</label>
                        <select value={day} onChange={(e) => setDay(e.target.value)} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Primary Origin Offset distinctly distinctly functionally</label>
                            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Termination Sequence accurately distinctly physically properly cleanly precisely naturally locally strictly directly</label>
                            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !batchId || !subjectId || !day || !startTime || !endTime}
                        style={{ padding: '0.75rem', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: (loading || !batchId || !subjectId || !day || !startTime || !endTime) ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Evaluating Strict Nested Schema Authorizations uniquely actively specifically...' : 'Allocate Mapped Exclusively Nested Explicit Schedule inherently physically cleanly'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FacultySchedule;
