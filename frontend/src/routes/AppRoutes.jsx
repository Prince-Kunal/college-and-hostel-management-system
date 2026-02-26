import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import HostelDashboard from '../pages/hostel/HostelDashboard';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes inside Layout */}
            <Route element={<Layout />}>
                {/* Redirect root to login for now */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/faculty" element={<FacultyDashboard />} />
                <Route path="/hostel" element={<HostelDashboard />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
