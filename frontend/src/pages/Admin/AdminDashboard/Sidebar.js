import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Componet/CSS/Sidebar.css";
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import Person3Icon from '@mui/icons-material/Person3';
import ForestIcon from '@mui/icons-material/Forest';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Sidebar = () => {
    const navigate = useNavigate();
    const [currentTheme, setCurrentTheme] = useState('light');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/LoginForm');
    };

    const changeTheme = (theme) => {
        setCurrentTheme(theme);
        localStorage.setItem('adminTheme', theme);
        
        // Apply theme styles
        const sidebar = document.querySelector('.sidebar');
        const homeContainer = document.querySelector('.homeContainer');
        
        if (sidebar && homeContainer) {
            switch (theme) {
                case 'light':
                    sidebar.style.backgroundColor = 'white';
                    sidebar.style.color = '#333';
                    homeContainer.style.backgroundColor = 'lightblue';
                    homeContainer.style.color = '#333';
                    break;
                case 'dark':
                    sidebar.style.backgroundColor = '#333';
                    sidebar.style.color = 'white';
                    homeContainer.style.backgroundColor = '#1a1a1a';
                    homeContainer.style.color = 'white';
                    break;
                case 'blue':
                    sidebar.style.backgroundColor = 'darkblue';
                    sidebar.style.color = 'white';
                    homeContainer.style.backgroundColor = '#e6f3ff';
                    homeContainer.style.color = '#333';
                    break;
                default:
                    break;
            }
        }
    };

    // Load saved theme on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('adminTheme') || 'light';
        setCurrentTheme(savedTheme);
        changeTheme(savedTheme);
    }, []);

    return (
        <div className="sidebar">
            <div className="top">
                <span className="logo">Admin</span>
            </div>
            <hr/>
            <div className="center">
                <ul>
                    <p className="titlee">MAIN</p>
                    <li onClick={() => navigate('/Dashboard')}>
                        <DashboardIcon className="icon"/>
                        <span>Dashboard</span>
                    </li>
                    <p className="titlee">USER</p>
                    <li onClick={() => navigate('/admin/users')}>
                        <PersonIcon className="icon"/>
                        <span>Users</span>
                    </li>
                    <li onClick={() => navigate('/admin/guides')}>
                        <Person3Icon className="icon"/>
                        <span>Guides</span>
                    </li>
                    <li onClick={() => navigate('/admin/vehicle-owners')}>
                        <DirectionsCarIcon className="icon"/>
                        <span>Vehicle & Owner</span>
                    </li>
                    <li onClick={() => navigate('/admin/vehicles')}>
                        <DirectionsCarIcon className="icon"/>
                        <span>Vehicle Monitoring</span>
                    </li>
                    <p className="titlee">SERVICE</p>
                    <li onClick={() => navigate('/admin/packages')}>
                        <ForestIcon className="icon"/>
                        <span>Packages</span>
                    </li>
                    <li onClick={() => navigate('/admin/feedback')}>
                        <ChatIcon className="icon"/>
                        <span>Feedback</span>
                    </li>
                    <li onClick={() => navigate('/admin/notifications')}>
                        <NotificationsIcon className="icon"/>
                        <span>Notifications</span>
                    </li>
                    <p className="titlee">USER</p>
                    <li>
                        <QueryStatsIcon className="icon"/>
                        <span>Stats</span>
                    </li>
                    <li>
                        <SettingsIcon className="icon"/>
                        <span>Settings</span>
                    </li>
                    <p className="titlee">USER</p>
                    <li>
                        <AccountCircleIcon className="icon"/>
                        <span>Profile</span>
                    </li>
                    <li onClick={handleLogout}>
                        <LogoutIcon className="icon"/>
                        <span>Logout</span>
                    </li>
                </ul>
            </div>
            <div className="bottom">
                <div 
                    className="colorOption" 
                    onClick={() => changeTheme('light')}
                    style={{ 
                        backgroundColor: 'whitesmoke',
                        border: currentTheme === 'light' ? '2px solid #7451f8' : '1px solid #7451f8',
                        cursor: 'pointer'
                    }}
                    title="Light Theme"
                ></div>
                <div 
                    className="colorOption" 
                    onClick={() => changeTheme('dark')}
                    style={{ 
                        backgroundColor: '#333',
                        border: currentTheme === 'dark' ? '2px solid #7451f8' : '1px solid #7451f8',
                        cursor: 'pointer'
                    }}
                    title="Dark Theme"
                ></div>
                <div 
                    className="colorOption" 
                    onClick={() => changeTheme('blue')}
                    style={{ 
                        backgroundColor: 'darkblue',
                        border: currentTheme === 'blue' ? '2px solid #7451f8' : '1px solid #7451f8',
                        cursor: 'pointer'
                    }}
                    title="Blue Theme"
                ></div>
            </div>
        </div>
    );
};

export default Sidebar;