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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/LoginForm');
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>e="title">USEFUL</p>
                <span className="text">Booking Revenue</span>
              </Link>o="/admin/booking-history">
            </div>aCalendarCheck className="icon" />
            <li><span>Bookings</span>
              <button 
                className="quick-booking-btn"
                onClick={() => setShowQuickBooking(true)}
              >Link to="/admin/booking-revenue" className="link">
                <FaPlus className="icon" />
                <span>Quick Book</span>w.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              </button>th strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </li> </svg>
            <li></span>
              <Link to="/admin/notifications"> Revenue</span>
                <FaBell className="icon" />
                <span>Notifications</span>
              </Link>
            </li>tton 
            <li>className="quick-booking-btn"
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