import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const HostelDashboard = () => {
    // Shared State
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Tab State
    const [adminTab, setAdminTab] = useState('rooms'); // 'rooms', 'menu', 'leave', 'complaints'
    const [studentTab, setStudentTab] = useState('menu'); // 'menu', 'leave', 'complaints'

    // Admin Data State
    const [rooms, setRooms] = useState([]);
    const [allocationsGrouped, setAllocationsGrouped] = useState({});
    const [users, setUsers] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [allComplaints, setAllComplaints] = useState([]);

    // Shared/Student Data State
    const [todayMenu, setTodayMenu] = useState(null);
    const [myLeaves, setMyLeaves] = useState([]);
    const [myComplaints, setMyComplaints] = useState([]);

    // Forms
    const getTodayStr = () => new Date().toISOString().split('T')[0];
    const [roomForm, setRoomForm] = useState({ roomNumber: '', floor: 1, capacity: 2, type: 'boys' });
    const [allocForm, setAllocForm] = useState({ userId: '', roomId: '' });
    const [menuForm, setMenuForm] = useState({ date: getTodayStr(), breakfast: '', lunch: '', snacks: '', dinner: '' });
    const [leaveForm, setLeaveForm] = useState({ fromDate: getTodayStr(), toDate: getTodayStr(), reason: '' });
    const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                setRole(parsed.role || 'student');
                fetchAllData(parsed.role || 'student', parsed.uid);
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (role === 'admin' && menuForm.date) {
            fetchMenuForForm(menuForm.date);
        }
    }, [menuForm.date, role]);

    const fetchAllData = async (userRole, uid) => {
        setLoading(true);
        try {
            const today = getTodayStr();
            const fetchedMenu = await api.getMenu(today);
            setTodayMenu(fetchedMenu);
            
            if (userRole === 'admin') {
                const [roomsData, allocData, usersData, leavesData, complaintsData] = await Promise.all([
                    api.getRooms(),
                    api.getAllocations(),
                    api.getUsers(),
                    api.getAllLeaves(),
                    api.getAllComplaints()
                ]);
                setRooms(roomsData);
                setAllocationsGrouped(allocData);
                setUsers(usersData);
                setAllLeaves(leavesData);
                setAllComplaints(complaintsData);
            } else {
                const [myL, myC] = await Promise.all([
                    api.getMyLeaves(uid),
                    api.getMyComplaints(uid)
                ]);
                setMyLeaves(myL);
                setMyComplaints(myC);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuForForm = async (date) => {
        try {
            const menu = await api.getMenu(date);
            if (menu) {
                setMenuForm({
                    date: date,
                    breakfast: menu.meals.breakfast.join(', '),
                    lunch: menu.meals.lunch.join(', '),
                    snacks: menu.meals.snacks.join(', '),
                    dinner: menu.meals.dinner.join(', ')
                });
            } else {
                setMenuForm(prev => ({ ...prev, breakfast: '', lunch: '', snacks: '', dinner: '' }));
            }
        } catch(e) {}
    };

    // ── Handlers ──

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.createRoom({
                ...roomForm,
                floor: Number(roomForm.floor),
                capacity: Number(roomForm.capacity)
            });
            setRoomForm({ roomNumber: '', floor: 1, capacity: 2, type: 'boys' });
            fetchAllData(role, user.uid);
        } catch (err) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.allocateRoom(allocForm);
            setAllocForm({ userId: '', roomId: '' });
            fetchAllData(role, user.uid);
        } catch (err) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleSetMenu = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.setMenu({
                date: menuForm.date,
                createdBy: user.uid,
                meals: {
                    breakfast: menuForm.breakfast.split(',').map(s=>s.trim()).filter(Boolean),
                    lunch: menuForm.lunch.split(',').map(s=>s.trim()).filter(Boolean),
                    snacks: menuForm.snacks.split(',').map(s=>s.trim()).filter(Boolean),
                    dinner: menuForm.dinner.split(',').map(s=>s.trim()).filter(Boolean)
                }
            });
            alert("Menu saved successfully!");
            if (menuForm.date === getTodayStr()) {
                setTodayMenu(await api.getMenu(getTodayStr()));
            }
        } catch (err) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.applyLeave({
                userId: user.uid,
                ...leaveForm
            });
            alert("Leave application submitted!");
            setLeaveForm({ fromDate: getTodayStr(), toDate: getTodayStr(), reason: '' });
            setMyLeaves(await api.getMyLeaves(user.uid));
        } catch(err) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleUpdateLeaveStatus = async (id, status) => {
        try {
            await api.updateLeaveStatus(id, status);
            setAllLeaves(await api.getAllLeaves());
        } catch(e) { alert(e.message); }
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.submitComplaint({
                userId: user.uid,
                ...complaintForm
            });
            alert("Complaint submitted!");
            setComplaintForm({ title: '', description: '' });
            setMyComplaints(await api.getMyComplaints(user.uid));
        } catch(err) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleResolveComplaint = async (id) => {
        try {
            await api.resolveComplaint(id);
            setAllComplaints(await api.getAllComplaints());
        } catch(e) { alert(e.message); }
    };

    const availableRooms = rooms.filter(r => r.occupantCount < r.capacity);

    // ── Render Functions ──

    const renderAdminRoomsView = () => (
        <React.Fragment>
            <main className="sd-grid" style={{ marginBottom: '32px' }}>
                <section className="sd-card">
                    <div className="sd-card-header">
                        <h2>Create Room</h2>
                    </div>
                    <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={styles.label}>Room Number</label>
                            <input type="text" required value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} style={styles.input} />
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Floor</label>
                                <input type="number" required min="0" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: e.target.value})} style={styles.input} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Capacity</label>
                                <select value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} style={styles.input}>
                                    <option value="1">1 Person</option><option value="2">2 Persons</option><option value="3">3 Persons</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={styles.label}>Room Type</label>
                            <select value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})} style={styles.input}>
                                <option value="boys">Boys</option><option value="girls">Girls</option><option value="faculty">Faculty</option>
                            </select>
                        </div>
                        <button type="submit" disabled={actionLoading} className="sd-btn-primary">
                            {actionLoading ? 'Creating...' : 'Create Room'}
                        </button>
                    </form>
                </section>

                <section className="sd-card">
                    <div className="sd-card-header">
                        <h2>Allocate Room</h2>
                    </div>
                    <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={styles.label}>Select User</label>
                            <select required value={allocForm.userId} onChange={e => setAllocForm({...allocForm, userId: e.target.value})} style={styles.input}>
                                <option value="">-- Choose User --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name ? `${u.name} (${u.email})` : u.email} - [{u.role || 'student'}]</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Select Available Room</label>
                            <select required value={allocForm.roomId} onChange={e => setAllocForm({...allocForm, roomId: e.target.value})} style={styles.input}>
                                <option value="">-- Choose Room --</option>
                                {availableRooms.map(r => (
                                    <option key={r.id} value={r.id}>Room {r.roomNumber} (Floor {r.floor}) - {r.type.toUpperCase()} - {r.occupantCount}/{r.capacity} filled</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" disabled={actionLoading} className="sd-btn-primary" style={{ marginTop: 'auto' }}>
                            {actionLoading ? 'Allocating...' : 'Allocate User'}
                        </button>
                    </form>
                </section>
            </main>

            <div className="sd-card">
                <div className="sd-card-header"><h2>Room Directory & Allocations</h2></div>
                {Object.keys(allocationsGrouped).length === 0 ? (
                    <p style={{ color: 'var(--sd-text-secondary)' }}>No rooms or allocations found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {Object.entries(allocationsGrouped).map(([floorName, floorRooms]) => (
                            <div key={floorName}>
                                <h3 style={{ fontSize: '16px', color: 'var(--sd-text-primary)', marginBottom: '12px', borderBottom: '2px solid var(--sd-border)', paddingBottom: '8px' }}>{floorName}</h3>
                                <div className="sd-table-wrapper">
                                    <table className="sd-table">
                                        <thead><tr><th>Room</th><th>Type</th><th>Occupancy</th><th>Residents</th></tr></thead>
                                        <tbody>
                                            {floorRooms.map(room => (
                                                <tr key={room.id}>
                                                    <td style={{ fontWeight: 'bold' }}>{room.roomNumber}</td>
                                                    <td><span style={{ background: room.type === 'faculty' ? '#fef3c7' : room.type === 'boys' ? '#e0f2fe' : '#fce7f3', color: room.type === 'faculty' ? '#d97706' : room.type === 'boys' ? '#0369a1' : '#be185d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{room.type.toUpperCase()}</span></td>
                                                    <td><span style={{ color: room.occupantCount >= room.capacity ? 'var(--sd-danger)' : 'var(--sd-success)', fontWeight: 'bold' }}>{room.occupantCount} / {room.capacity}</span></td>
                                                    <td>
                                                        {room.users && room.users.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{room.users.map((u, i) => (<span key={i} style={{ fontSize: '13px' }}>• {u.name || u.email}</span>))}</div>
                                                        ) : (<span style={{ color: 'var(--sd-text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>Empty</span>)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </React.Fragment>
    );

    const renderAdminMenuView = () => (
        <div className="sd-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="sd-card-header"><h2>Update Mess Menu</h2></div>
            <form onSubmit={handleSetMenu} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={styles.label}>Select Date</label>
                    <input type="date" required value={menuForm.date} onChange={e => setMenuForm({...menuForm, date: e.target.value})} style={styles.input} />
                </div>
                <div>
                    <label style={styles.label}>Breakfast (comma separated)</label>
                    <textarea required value={menuForm.breakfast} onChange={e => setMenuForm({...menuForm, breakfast: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '60px'}} placeholder="Poha, Tea, Toast" />
                </div>
                <div>
                    <label style={styles.label}>Lunch (comma separated)</label>
                    <textarea required value={menuForm.lunch} onChange={e => setMenuForm({...menuForm, lunch: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '60px'}} placeholder="Rice, Dal, Roti, Sabzi" />
                </div>
                <div>
                    <label style={styles.label}>Snacks (comma separated)</label>
                    <textarea required value={menuForm.snacks} onChange={e => setMenuForm({...menuForm, snacks: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '60px'}} placeholder="Samosa, Coffee" />
                </div>
                <div>
                    <label style={styles.label}>Dinner (comma separated)</label>
                    <textarea required value={menuForm.dinner} onChange={e => setMenuForm({...menuForm, dinner: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '60px'}} placeholder="Rice, Paneer, Roti" />
                </div>
                <button type="submit" disabled={actionLoading} className="sd-btn-primary">
                    {actionLoading ? 'Saving...' : 'Save Menu'}
                </button>
            </form>
        </div>
    );

    const renderAdminLeaveView = () => (
        <div className="sd-card">
            <div className="sd-card-header"><h2>Leave Requests Management</h2></div>
            <div className="sd-table-wrapper">
                <table className="sd-table">
                    <thead><tr><th>Student</th><th>Duration</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {allLeaves.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No requests</td></tr>}
                        {allLeaves.map(leave => (
                            <tr key={leave.id}>
                                <td>{leave.user?.name || 'Unknown'} <br/><span style={{fontSize:'12px', color:'gray'}}>{leave.user?.email}</span></td>
                                <td>{leave.fromDate} <br/>to<br/> {leave.toDate}</td>
                                <td style={{ maxWidth: '200px' }}>{leave.reason}</td>
                                <td>
                                    <span className={`sd-badge sd-badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}`}>
                                        {leave.status}
                                    </span>
                                </td>
                                <td>
                                    {leave.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleUpdateLeaveStatus(leave.id, 'approved')} style={{ padding: '6px 12px', background: 'var(--sd-success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                                            <button onClick={() => handleUpdateLeaveStatus(leave.id, 'rejected')} style={{ padding: '6px 12px', background: 'var(--sd-danger)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAdminComplaintsView = () => (
        <div className="sd-card">
            <div className="sd-card-header"><h2>Student Complaints</h2></div>
            <div className="sd-table-wrapper">
                <table className="sd-table">
                    <thead><tr><th>Student</th><th>Title</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {allComplaints.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No complaints found.</td></tr>}
                        {allComplaints.map(complaint => (
                            <tr key={complaint.id}>
                                <td>{complaint.user?.name || 'Unknown'} <br/><span style={{fontSize:'12px', color:'gray'}}>{complaint.user?.email}</span></td>
                                <td style={{ fontWeight: 'bold' }}>{complaint.title}</td>
                                <td style={{ maxWidth: '250px' }}>{complaint.description}</td>
                                <td>
                                    <span className={`sd-badge sd-badge-${complaint.status === 'resolved' ? 'success' : 'warning'}`}>
                                        {complaint.status}
                                    </span>
                                </td>
                                <td>
                                    {complaint.status === 'pending' && (
                                        <button onClick={() => handleResolveComplaint(complaint.id)} style={{ padding: '6px 12px', background: 'var(--sd-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                            Mark Resolved
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStudentMenuView = () => (
        <div className="sd-grid" style={{ alignItems: 'start' }}>
            <div className="sd-card">
                <div className="sd-card-header" style={{ marginBottom: '16px' }}><h2>Today's Mess Menu 🍽️</h2></div>
                {todayMenu ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <span style={{ fontWeight: 'bold', color: '#d97706', display: 'inline-block', width: '90px' }}>☕ Breakfast: </span>
                            <span style={{ color: 'var(--sd-text-primary)' }}>{todayMenu.meals.breakfast.join(', ')}</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--sd-border)', paddingTop: '16px' }}>
                            <span style={{ fontWeight: 'bold', color: '#0369a1', display: 'inline-block', width: '90px' }}>🍱 Lunch: </span>
                            <span style={{ color: 'var(--sd-text-primary)' }}>{todayMenu.meals.lunch.join(', ')}</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--sd-border)', paddingTop: '16px' }}>
                            <span style={{ fontWeight: 'bold', color: '#b45309', display: 'inline-block', width: '90px' }}>🍪 Snacks: </span>
                            <span style={{ color: 'var(--sd-text-primary)' }}>{todayMenu.meals.snacks.join(', ')}</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--sd-border)', paddingTop: '16px' }}>
                            <span style={{ fontWeight: 'bold', color: '#4338ca', display: 'inline-block', width: '90px' }}>🍲 Dinner: </span>
                            <span style={{ color: 'var(--sd-text-primary)' }}>{todayMenu.meals.dinner.join(', ')}</span>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--sd-text-secondary)' }}>No menu has been updated for today yet.</p>
                )}
            </div>

            {/* Quick Actions for Students */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div 
                    onClick={() => setStudentTab('leave')}
                    style={{ background: 'white', border: '1px solid var(--sd-border)', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                        <span>🎒</span> Leave Application
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--sd-text-secondary)', lineHeight: '1.5' }}>Apply for hostel leave or check your past request history.</p>
                </div>

                <div 
                    onClick={() => setStudentTab('complaints')}
                    style={{ background: 'white', border: '1px solid var(--sd-border)', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                        <span>⚠️</span> Report a Complaint
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--sd-text-secondary)', lineHeight: '1.5' }}>Facing an issue with your room or facilities? Let us know.</p>
                </div>
            </div>
        </div>
    );

    const renderStudentLeaveView = () => (
        <React.Fragment>
            <button onClick={() => setStudentTab('menu')} style={styles.backButton}>
                ← Back to Dashboard
            </button>
            <div className="sd-grid" style={{ alignItems: 'start' }}>
                <div className="sd-card">
                    <div className="sd-card-header"><h2>Apply for Leave</h2></div>
                    <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>From Date</label>
                                <input type="date" required min={getTodayStr()} value={leaveForm.fromDate} onChange={e => setLeaveForm({...leaveForm, fromDate: e.target.value})} style={styles.input} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>To Date</label>
                                <input type="date" required min={leaveForm.fromDate} value={leaveForm.toDate} onChange={e => setLeaveForm({...leaveForm, toDate: e.target.value})} style={styles.input} />
                            </div>
                        </div>
                        <div>
                            <label style={styles.label}>Reason for Leave</label>
                            <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '80px'}} placeholder="e.g. Going home for family function" />
                        </div>
                        <button type="submit" disabled={actionLoading} className="sd-btn-primary">
                            {actionLoading ? 'Submitting...' : 'Submit Leave Request'}
                        </button>
                    </form>
                </div>

                <div className="sd-card">
                    <div className="sd-card-header"><h2>My Leave History</h2></div>
                    <div className="sd-table-wrapper">
                        <table className="sd-table">
                            <thead><tr><th>Duration</th><th>Reason</th><th>Status</th></tr></thead>
                            <tbody>
                                {myLeaves.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No past leaves</td></tr>}
                                {myLeaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td><span style={{fontSize:'13px'}}>{leave.fromDate}<br/>to {leave.toDate}</span></td>
                                        <td><span style={{fontSize:'13px'}}>{leave.reason}</span></td>
                                        <td>
                                            <span className={`sd-badge sd-badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );

    const renderStudentComplaintsView = () => (
        <React.Fragment>
            <button onClick={() => setStudentTab('menu')} style={styles.backButton}>
                ← Back to Dashboard
            </button>
            <div className="sd-grid" style={{ alignItems: 'start' }}>
                <div className="sd-card">
                    <div className="sd-card-header"><h2>File a Complaint</h2></div>
                    <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={styles.label}>Title</label>
                            <input type="text" required value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})} style={styles.input} placeholder="e.g. Water purifier not working" />
                        </div>
                        <div>
                            <label style={styles.label}>Description</label>
                            <textarea required value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})} style={{...styles.input, resize: 'vertical', minHeight: '80px'}} placeholder="Please provide details..." />
                        </div>
                        <button type="submit" disabled={actionLoading} className="sd-btn-primary">
                            {actionLoading ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </form>
                </div>

                <div className="sd-card">
                    <div className="sd-card-header"><h2>My Complaints</h2></div>
                    <div className="sd-table-wrapper">
                        <table className="sd-table">
                            <thead><tr><th>Title</th><th>Status</th></tr></thead>
                            <tbody>
                                {myComplaints.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center' }}>No past complaints</td></tr>}
                                {myComplaints.map(complaint => (
                                    <tr key={complaint.id}>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{complaint.title}</div>
                                            <div style={{ fontSize: '13px', color: 'gray' }}>{complaint.description}</div>
                                        </td>
                                        <td>
                                            <span className={`sd-badge sd-badge-${complaint.status === 'resolved' ? 'success' : 'warning'}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Hostel Dashboard...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="sd-header">
                <div className="sd-header-left">
                    <p>Facilities</p>
                    <h1>Hostel Management 🏢</h1>
                </div>
            </header>

            {error && <p style={{ color: 'var(--sd-danger)', marginBottom: '16px' }}>{error}</p>}

            {/* Admin Navbar */}
            {role === 'admin' && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--sd-border)' }}>
                    <button onClick={() => setAdminTab('rooms')} style={adminTab === 'rooms' ? styles.activeTab : styles.inactiveTab}>Rooms & Allocation</button>
                    <button onClick={() => setAdminTab('menu')} style={adminTab === 'menu' ? styles.activeTab : styles.inactiveTab}>Mess Menu</button>
                    <button onClick={() => setAdminTab('leave')} style={adminTab === 'leave' ? styles.activeTab : styles.inactiveTab}>Leave Requests</button>
                    <button onClick={() => setAdminTab('complaints')} style={adminTab === 'complaints' ? styles.activeTab : styles.inactiveTab}>Complaints</button>
                </div>
            )}

            {/* Render Active View */}
            {role === 'admin' ? (
                <React.Fragment>
                    {adminTab === 'rooms' && renderAdminRoomsView()}
                    {adminTab === 'menu' && renderAdminMenuView()}
                    {adminTab === 'leave' && renderAdminLeaveView()}
                    {adminTab === 'complaints' && renderAdminComplaintsView()}
                </React.Fragment>
            ) : (
                <React.Fragment>
                    {studentTab === 'menu' && renderStudentMenuView()}
                    {studentTab === 'leave' && renderStudentLeaveView()}
                    {studentTab === 'complaints' && renderStudentComplaintsView()}
                </React.Fragment>
            )}
        </div>
    );
};

const styles = {
    label: {
        display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--sd-text-secondary)'
    },
    input: {
        width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--sd-border)', outline: 'none', background: '#f8fafc', fontFamily: 'inherit', fontSize: '14px', transition: 'border-color 0.2s'
    },
    activeTab: {
        background: 'var(--sd-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    inactiveTab: {
        background: '#f1f5f9', border: 'none', color: 'var(--sd-text-secondary)', padding: '10px 24px', borderRadius: '100px', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', cursor: 'pointer'
    },
    backButton: {
        background: 'transparent', border: 'none', color: 'var(--sd-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', padding: '8px 0'
    }
};

export default HostelDashboard;
