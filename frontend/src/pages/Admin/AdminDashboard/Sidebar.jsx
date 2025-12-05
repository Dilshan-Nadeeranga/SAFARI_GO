//frontend/src/pages/Admin/AdminDashboard/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarCheck, FaStar, FaBars, FaTimes, FaChartLine, FaUserTie, FaCar, FaBell, FaBook, FaPlus } from 'react-icons/fa';
import '../Componet/CSS/Sidebar.css';
import QuickBooking from '../../../components/Admin/QuickBooking';

const Sidebar = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
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

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    cursor: 'pointer',
    width: '100%',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    color: 'inherit'
  };

  // Load saved theme on component mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme') || 'light';
    setCurrentTheme(savedTheme);
    changeTheme(savedTheme);
  }, []);

  return (
    <>
      <div className={`sidebar ${showSidebar ? '' : 'collapsed'}`}>
        <div className="top">
          <Link to="/Dashboard" className="logo">
            SafariLK
          </Link>
          <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <hr />
        <div className="center">
          <ul>
            <p className="title">MAIN</p>
            <li>
              <Link to="/Dashboard">
                <FaChartLine className="icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <p className="title">LISTS</p>
            <li>
              <Link to="/admin/users">
                <FaUsers className="icon" />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/guides">
                <FaUserTie className="icon" />
                <span>Guides</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/vehicle-owners">
                <FaCar className="icon" />
                <span>Vehicle Owners</span>
              </Link>
            </li>
            <p className="title">USEFUL</p>
            <li>
              <Link to="/admin/booking-history">
                <FaCalendarCheck className="icon" />
                <span>Bookings</span>
              </Link>
            </li>
            <li>
              <button 
                className="quick-booking-btn"
                onClick={() => setShowQuickBooking(true)}
                style={buttonStyle}
              >
                <FaPlus className="icon" />
                <span>Quick Book</span>
              </button>
            </li>
            <li>
              <Link to="/admin/notifications">
                <FaBell className="icon" />
                <span>Notifications</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/premium-subscribers">
                <FaStar className="icon" />
                <span>Premium Users</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/feedback">
                <FaBook className="icon" />
                <span>Feedback</span>
              </Link>
            </li>
            <p className="title">USER</p>
            <li>
              <button onClick={handleLogout} style={buttonStyle}>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
        
        {/* Theme Switcher */}
        <div className="bottom">
          <div 
            className="colorOption" 
            onClick={() => changeTheme('light')}
            style={{ 
              backgroundColor: 'whitesmoke',
              border: currentTheme === 'light' ? '2px solid #7451f8' : '1px solid #7451f8'
            }}
            title="Light Theme"
          ></div>
          <div 
            className="colorOption" 
            onClick={() => changeTheme('dark')}
            style={{ 
              backgroundColor: '#333',
              border: currentTheme === 'dark' ? '2px solid #7451f8' : '1px solid #7451f8'
            }}
            title="Dark Theme"
          ></div>
          <div 
            className="colorOption" 
            onClick={() => changeTheme('blue')}
            style={{ 
              backgroundColor: 'darkblue',
              border: currentTheme === 'blue' ? '2px solid #7451f8' : '1px solid #7451f8'
            }}
            title="Blue Theme"
          ></div>
        </div>
      </div>
      
      {/* Quick Booking Modal */}
      <QuickBooking 
        show={showQuickBooking} 
        onClose={() => setShowQuickBooking(false)} 
      />
    </>
  );
};

export default Sidebar;