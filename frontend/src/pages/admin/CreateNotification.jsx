import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const CreateNotification = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('all');
    const [batches, setBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch batches for the multi-select
        const fetchBatches = async () => {
            try {
                // Since api.js doesn't have getBatches yet, we fetch manually like other admin pages
                const res = await fetch(`http://${window.location.hostname}:8000/api/v1/batches`);
                const data = await res.json();
                if (data.success) {
                    setBatches(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch batches", err);
            }
        };
        fetchBatches();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            
            await api.createNotification({
                title,
                message,
                targetRole,
                targetBatches: selectedBatches,
                createdBy: user ? user.uid : 'admin'
            });

            alert('Notification sent successfully!');
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Failed to send notification');
            setLoading(false);
        }
    };

    const handleBatchSelection = (batchId) => {
        setSelectedBatches(prev => {
            if (prev.includes(batchId)) {
                return prev.filter(id => id !== batchId);
            } else {
                return [...prev, batchId];
            }
        });
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Operations</p>
                    <h1>Send Notification 📣</h1>
                    <span className="sub">Broadcast alerts to specific roles and batches</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/admin')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Back</button>
                </div>
            </header>

            <div className="sd-card">
                {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sd-text-secondary)' }}>Title</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="E.g., Tomorrow's Holiday, Important Deadline"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--sd-border)', fontSize: '15px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sd-text-secondary)' }}>Message</label>
                        <textarea 
                            required 
                            rows="4"
                            placeholder="Detailed message..."
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--sd-border)', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sd-text-secondary)' }}>Target Audience</label>
                        <select 
                            value={targetRole} 
                            onChange={(e) => {
                                setTargetRole(e.target.value);
                                setSelectedBatches([]); // Reset batches if role changes
                            }}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--sd-border)', fontSize: '15px', backgroundColor: 'var(--sd-bg)' }}
                        >
                            <option value="all">Everyone (All Students & Faculty)</option>
                            <option value="student">Only Students</option>
                            <option value="faculty">Only Faculty</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--sd-text-secondary)' }}>
                            Target Specific Batches <span style={{fontWeight:'400', color:'#94a3b8'}}>(Optional - leave empty for ALL)</span>
                        </label>
                        
                        <div style={{ 
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                            gap: '12px', padding: '16px', background: 'var(--sd-bg)', 
                            borderRadius: '8px', border: '1px solid var(--sd-border)',
                            maxHeight: '200px', overflowY: 'auto'
                        }}>
                            {batches.map(batch => (
                                <label key={batch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedBatches.includes(batch.id)}
                                        onChange={() => handleBatchSelection(batch.id)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--sd-primary)' }}
                                    />
                                    {batch.name}
                                </label>
                            ))}
                            {batches.length === 0 && <span style={{color: '#94a3b8'}}>No batches found...</span>}
                        </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <button type="submit" disabled={loading} className="sd-btn-primary" style={{ width: '100%', padding: '14px' }}>
                            {loading ? 'Sending Notification...' : 'Broadcast Notification'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateNotification;
