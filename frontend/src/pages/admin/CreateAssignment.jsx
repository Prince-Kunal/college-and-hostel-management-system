import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAssignment = () => {
    const navigate = useNavigate();
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
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Portal</p>
                    <h1>Assign Faculty 🧑‍🏫</h1>
                    <span className="sub">Map faculty members to subjects and batches</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/assignments')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Back to Assignments</button>
                </div>
            </header>

            <div className="sd-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Assignment Details</h3>
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        Faculty explicitly mapped correctly!
                    </div>
                )}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Link Target Batch</label>
                        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                            <option value="">-- Dropdown Batch Menu --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Map Subject Node</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                            <option value="">-- Dropdown Subject Resource --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select Explicit Faculty Operator</label>
                        <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                            <option value="">-- Access Faculty Accounts --</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.email}</option>)}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !batchId || !subjectId || !facultyId}
                        className="sd-btn-primary"
                        style={{ padding: '14px', marginTop: '8px', background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: (loading || !batchId || !subjectId || !facultyId) ? 'not-allowed' : 'pointer', opacity: (loading || !batchId || !subjectId || !facultyId) ? 0.6 : 1 }}
                    >
                        {loading ? 'Transmitting Mapping Keys...' : 'Write Secure Assignment Form'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignment;
