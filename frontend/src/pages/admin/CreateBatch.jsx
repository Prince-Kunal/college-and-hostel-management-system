import React, { useState } from 'react';

const CreateBatch = ({ onBatchCreated }) => {
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
        <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h2 style={{ marginTop: 0 }}>Create New Batch</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="e.g. 2024 Computer Science Section A" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    style={{ padding: '0.75rem', flex: 1, minWidth: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ 
                        padding: '0.75rem 1.5rem', 
                        backgroundColor: '#0d6efd', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Creating...' : 'Create Batch'}
                </button>
            </form>
        </div>
    );
};

export default CreateBatch;
