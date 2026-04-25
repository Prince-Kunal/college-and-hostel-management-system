import React, { useState, useEffect } from 'react';

const CreateAssignment = () => {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);

    const [batchId, setBatchId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [facultyId, setFacultyId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchDependencies();
    }, []);

    const fetchDependencies = async () => {
        try {
            const [resBatches, resSubjects, resUsers] = await Promise.all([
                fetch(`http://${window.location.hostname}:8000/api/v1/batches`),
                fetch(`http://${window.location.hostname}:8000/api/v1/subjects`),
                fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`)
            ]);
            
            const dataBatches = await resBatches.json();
            const dataSubjects = await resSubjects.json();
            const dataUsers = await resUsers.json();

            if (dataBatches.success) setBatches(dataBatches.data);
            if (dataSubjects.success) setSubjects(dataSubjects.data);
            if (dataUsers.success) {
                setFaculties(dataUsers.data.filter(u => u.role === 'faculty'));
            }
        } catch (err) {
            console.error('Failed to remotely load dependency mappings:', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/faculty-assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchId, subjectId, facultyId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed uniquely securing logical assignment maps');

            setSuccess(true);
            setBatchId('');
            setSubjectId('');
            setFacultyId('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Assign Faculty to Subject Map</h2>
                {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{error}</p>}
                {success && <p style={{ color: '#198754', fontWeight: 'bold' }}>Faculty explicitly mapped correctly!</p>}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Link Target Batch</label>
                        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Dropdown Batch Menu --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Map Subject Node</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Dropdown Subject Resource --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Explicit Faculty Operator</label>
                        <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Access Faculty Accounts --</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.email}</option>)}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !batchId || !subjectId || !facultyId}
                        style={{ padding: '0.75rem', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: (loading || !batchId || !subjectId || !facultyId) ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Transmitting Mapping Keys...' : 'Write Secure Assignment Form'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignment;
