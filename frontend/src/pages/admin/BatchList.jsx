import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BatchList = ({ refreshTrigger }) => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Assignment States
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch batches
            const resBatches = await fetch(`http://${window.location.hostname}:8000/api/v1/batches`);
            const dataBatches = await resBatches.json();
            if (dataBatches.success) setBatches(dataBatches.data);
            
            // Fetch users via admin endpoint
            const resUsers = await fetch(`http://${window.location.hostname}:8000/api/v1/admin/users`);
            const dataUsers = await resUsers.json();
            if (dataUsers.success) {
                // Filter only users natively flagged as 'student'
                setStudents(dataUsers.data.filter(u => u.role === 'student'));
            }
        } catch (error) {
            console.error('Error fetching batch/user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedBatch || !selectedStudent) return;
        
        setAssigning(true);
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/batches/${selectedBatch}/assign-student`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: selectedStudent })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Assignment failed');
            
            alert('Student safely assigned to batch!');
            // Reset dropdown & update UI state logically
            setSelectedStudent('');
            fetchData(); 
        } catch (err) {
            alert(err.message);
        } finally {
            setAssigning(false);
        }
    };

    const getBatchNameMap = () => {
        const map = {};
        batches.forEach(b => { map[b.id] = b.name; });
        return map;
    };
    const batchNameMap = getBatchNameMap();

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Portal</p>
                    <h1>Batch Management 👥</h1>
                    <span className="sub">Manage batches and assign students</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/batches/create')} className="sd-btn-primary">+ Create New Batch</button>
                </div>
            </header>

            <div className="sd-grid">
                {/* View Batches List */}
                <div className="sd-card">
                    <h3 className="sd-section-title">Active Batches</h3>
                    {loading ? <p>Loading batches...</p> : batches.length === 0 ? <p style={{ fontStyle: 'italic', color: '#666' }}>No batches registered yet.</p> : (
                        <div className="sd-class-list">
                            {batches.map(b => (
                                <div key={b.id} className="sd-class-item">
                                    <div className="sd-class-info">
                                        <div className="sd-class-header">
                                            <h3>{b.name}</h3>
                                        </div>
                                        <div className="sd-class-meta">
                                            <span>Created on {new Date(b.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assign Student Module */}
                <div className="sd-card">
                    <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Assign Student to Batch</h3>
                    <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select Batch</label>
                            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                                <option value="">-- Select Target Batch --</option>
                                {batches.map(b => <option value={b.id} key={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select Student</label>
                            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
                                <option value="">-- Choose Student --</option>
                                {students.map(s => (
                                    <option value={s.id} key={s.id}>
                                        {s.email} {s.batchId ? `(Currently: ${batchNameMap[s.batchId] || s.batchId})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={assigning || !selectedBatch || !selectedStudent} 
                            className="sd-btn-primary"
                            style={{ padding: '14px', marginTop: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: (assigning || !selectedBatch || !selectedStudent) ? 'not-allowed' : 'pointer', opacity: (assigning || !selectedBatch || !selectedStudent) ? 0.6 : 1 }}
                        >
                            {assigning ? 'Assigning...' : 'Confirm Assignment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BatchList;
