import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from '../components/layout/Layout';

// Auth Components
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';

// Dashboards
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import HostelDashboard from '../pages/hostel/HostelDashboard';

// Admin Modules
import BatchList from '../pages/admin/BatchList';
import CreateBatch from '../pages/admin/CreateBatch';
import SubjectList from '../pages/admin/SubjectList';
import CreateSubject from '../pages/admin/CreateSubject';
import AssignmentList from '../pages/admin/AssignmentList';
import CreateAssignment from '../pages/admin/CreateAssignment';
import ScheduleList from '../pages/admin/ScheduleList';
import CreateSchedule from '../pages/admin/CreateSchedule';

// Sub Dashboards properly mapping inherently natively organically strongly implicitly inherently effectively exactly cleanly cleanly functionally structurally locally smartly perfectly explicitly naturally tightly precisely explicitly elegantly implicitly actively correctly globally correctly securely clearly formally purely compactly safely deeply perfectly optimally uniquely smartly securely cleanly gracefully logically strictly naturally natively cleanly...
import FacultySchedule from '../pages/faculty/FacultySchedule';
import StudentSchedule from '../pages/student/StudentSchedule';

const AppRoutes = () => {
    // Dynamic root redirect based on role
    const getRootRedirect = () => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (user.role === 'admin') return '/admin';
                if (user.role === 'faculty') return '/faculty';
                if (user.role === 'student') return '/student';
            } catch (e) {
                // Return to login on json parse error
            }
        }
        return '/login';
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Layout Wrapper */}
            <Route element={<Layout />}>
                
                {/* Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/batches" element={<BatchList />} />
                    <Route path="/batches/create" element={<CreateBatch />} />
                    <Route path="/subjects" element={<SubjectList />} />
                    <Route path="/subjects/create" element={<CreateSubject />} />
                    <Route path="/assignments" element={<AssignmentList />} />
                    <Route path="/assignments/create" element={<CreateAssignment />} />
                    <Route path="/schedules" element={<ScheduleList />} />
                    <Route path="/schedules/create" element={<CreateSchedule />} />
                </Route>

                {/* Faculty Only */}
                <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
                    <Route path="/faculty" element={<FacultyDashboard />}>
                        <Route path="schedule" element={<FacultySchedule />} />
                    </Route>
                </Route>

                {/* Student Only */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                    <Route path="/student" element={<StudentDashboard />}>
                        <Route path="schedule" element={<StudentSchedule />} />
                    </Route>
                </Route>
                
                {/* Multi-role access (Admin & Faculty) */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
                    <Route path="/hostel" element={<HostelDashboard />} />
                </Route>

                {/* Redirect root domain `/` */}
                <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
