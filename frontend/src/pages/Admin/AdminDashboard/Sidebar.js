import React from "react";
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/LoginForm');
    };

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
                <div className="colorOption"></div>
                <div className="colorOption"></div>
                <div className="colorOption"></div>
            </div>
        </div>
    );
};

export default Sidebar;