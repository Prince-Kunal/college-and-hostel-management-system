import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const AdminEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', time: '', location: '', description: '', capacity: '', audience: 'both'
    });
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await api.getEvents();
            setEvents(data || []);
        } catch (e) { console.warn('Could not fetch events'); }
        setLoading(false);
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setCreating(true);
        try {
            await api.createEvent({
                ...form,
                capacity: Number(form.capacity)
            });
            setForm({ name: '', time: '', location: '', description: '', capacity: '', audience: 'both' });
            setShowForm(false);
            fetchEvents();
        } catch (err) {
            setError(err.message || 'Failed to create event');
        }
        setCreating(false);
    };

    const fieldStyle = {
        width: '100%', padding: '12px 16px', fontSize: '14px', border: '1.5px solid #e2e8f0',
        borderRadius: '12px', background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '16px'
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Admin Panel</p>
                    <h1>Events Management 🎉</h1>
                    <span className="sub">Create and manage campus events</span>
                </div>
                <div className="sd-header-right">
                    <button onClick={() => navigate('/admin')} className="sd-btn-primary" style={{ padding: '8px 16px', background: 'var(--sd-card-bg)', color: 'var(--sd-primary)', border: '1px solid var(--sd-border)' }}>← Dashboard</button>
                </div>
            </header>

            {/* Create Event Button / Form */}
            {!showForm ? (
                <button onClick={() => setShowForm(true)} className="sd-btn-primary" style={{ marginBottom: '24px', maxWidth: '300px', background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Create New Event
                </button>
            ) : (
                <div className="sd-card" style={{ marginBottom: '24px' }}>
                    <h3 className="sd-section-title">New Event</h3>
                    {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>{error}</div>}
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Event Name</label>
                                <input style={fieldStyle} placeholder="e.g. Hackathon 2026" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Date & Time</label>
                                <input style={fieldStyle} type="datetime-local" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Location</label>
                                <input style={fieldStyle} placeholder="e.g. Main Auditorium" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Capacity</label>
                                <input style={fieldStyle} type="number" min="1" placeholder="e.g. 100" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Description</label>
                            <textarea style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Describe the event..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Audience</label>
                            <select style={fieldStyle} value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                                <option value="both">Students & Faculty</option>
                                <option value="student">Students Only</option>
                                <option value="faculty">Faculty Only</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="submit" disabled={creating} className="sd-btn-primary" style={{ background: 'linear-gradient(135deg, #5c5cff, #7c5cff)', color: 'white', flex: 1 }}>
                                {creating ? 'Creating...' : 'Create Event'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="sd-btn-primary" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid var(--sd-border)', flex: 0, padding: '12px 24px' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Events List */}
            {loading ? (
                <div className="sd-card">
                    {[1, 2, 3].map(i => <div key={i} className="sd-skeleton sd-skeleton-card"></div>)}
                </div>
            ) : events.length === 0 ? (
                <div className="sd-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <h3>No Events Yet</h3>
                    <p>Create your first campus event!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {events.map(evt => (
                        <div key={evt.id} className="sd-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--sd-text-primary)' }}>{evt.name}</h3>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                    background: evt.audience === 'student' ? '#e0f2fe' : evt.audience === 'faculty' ? '#f3e8ff' : '#dcfce7',
                                    color: evt.audience === 'student' ? '#0284c7' : evt.audience === 'faculty' ? '#9333ea' : '#16a34a'
                                }}>
                                    {evt.audience === 'both' ? 'All' : evt.audience === 'student' ? 'Students' : 'Faculty'}
                                </span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--sd-text-secondary)', margin: '0 0 16px 0', lineHeight: '1.5' }}>{evt.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--sd-text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    {new Date(evt.time).toLocaleString()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    {evt.location}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                                    {evt.enrolledCount || 0}/{evt.capacity} enrolled{evt.waitlistCount > 0 ? ` • ${evt.waitlistCount} waitlisted` : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
