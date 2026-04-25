import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dock.css';

/**
 * MagicUI-style Dock component
 * Renders a macOS-inspired floating dock navbar with icon magnification on hover.
 * 
 * @param {Array} items - Array of { path, label, icon (JSX) }
 */
const Dock = ({ items = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (items.length === 0) return null;

    return (
        <div className="dock-container">
            <div className="dock">
                {items.map((item, i) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/student' && item.path !== '/admin' && item.path !== '/faculty' &&
                         location.pathname.startsWith(item.path));
                    
                    return (
                        <button
                            key={i}
                            className={`dock-item ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            aria-label={item.label}
                        >
                            <span className="dock-tooltip">{item.label}</span>
                            {item.icon}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Dock;
