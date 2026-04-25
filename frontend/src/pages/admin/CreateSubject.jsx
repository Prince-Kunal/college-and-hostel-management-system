import React, { useState } from 'react';

const CreateSubject = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/v1/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to create subject');
            
            setName('');
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <h2 style={{ marginTop: 0 }}>Create New Subject</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: '#198754', fontWeight: 'bold' }}>Subject created successfully!</p>}
                
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Subject Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Data Structures and Algorithms" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#0d6efd', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading ? 'Registering Subject...' : 'Create Subject'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSubject;
