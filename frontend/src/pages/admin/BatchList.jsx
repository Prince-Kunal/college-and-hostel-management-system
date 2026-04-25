import React, { useState, useEffect } from 'react';

const BatchList = ({ refreshTrigger }) => {
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

    if (loading) return <p>Loading batches and directory...</p>;

    return (
        <div>
            {/* View Batches List */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h2 style={{ marginTop: 0 }}>Active Batches</h2>
                {batches.length === 0 ? <p>No batches registered yet.</p> : (
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        {batches.map(b => (
                            <li key={b.id}>
                                <strong>{b.name}</strong> <span style={{ color: '#666', fontSize: '0.9rem' }}>— Created on {new Date(b.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Assign Student Module */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Assign Student to Batch</h2>
                <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Batch</label>
                        <select 
                            value={selectedBatch} 
                            onChange={e => setSelectedBatch(e.target.value)} 
                            required 
                            style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">-- Select Target Batch --</option>
                            {batches.map(b => <option value={b.id} key={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Student</label>
                        <select 
                            value={selectedStudent} 
                            onChange={e => setSelectedStudent(e.target.value)} 
                            required 
                            style={{ padding: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
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
                        style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: assigning ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        {assigning ? 'Assigning Record...' : 'Confirm Assignment'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

export default BatchList;
