import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="app-container">
            <aside className="sidebar">
                <h2>CHMS Dashboard</h2>
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/admin">Admin Dashboard</NavLink>
                        </li>
                        <li>
                            <NavLink to="/student">Student Dashboard</NavLink>
                        </li>
                        <li>
                            <NavLink to="/faculty">Faculty Dashboard</NavLink>
                        </li>
                        <li>
                            <NavLink to="/hostel">Hostel Dashboard</NavLink>
                        </li>
                        <li>
                            <NavLink to="/login">Logout</NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>

            <div className="main-wrapper">
                <header className="top-navbar">
                    <div>Top Navbar Component File</div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
