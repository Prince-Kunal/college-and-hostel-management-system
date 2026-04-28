import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBatch = ({ onBatchCreated }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/batches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to create batch');
            
            setName('');
            if (onBatchCreated) onBatchCreated();
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
                    <h1>Create New Batch 📝</h1>
                    <span className="sub">Register a new academic batch</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/batches')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Back to Batches</button>
                </div>
            </header>

            <div className="sd-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
                <h3 className="sd-section-title" style={{ marginBottom: '20px' }}>Batch Details</h3>
                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Batch Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 2024 Computer Science Section A" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="sd-btn-primary"
                        style={{ padding: '14px', marginTop: '8px', background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? 'Creating...' : 'Create Batch'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateBatch;
