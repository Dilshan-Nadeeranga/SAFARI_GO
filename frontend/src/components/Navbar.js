import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li>
          <Link to="/explore-safaris" className="nav-link">Safaris</Link>
        </li>
        <li>
          <Link to="/vehicles" className="nav-link highlight">
            <span className="icon">🚗</span> Vehicles
          </Link>
        </li>
        <li>
          <Link to="/contact" className="nav-link">Contact</Link>
        </li>
        <li className="mobile-only">
          <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;