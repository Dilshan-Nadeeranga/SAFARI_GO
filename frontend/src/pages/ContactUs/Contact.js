import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Contactus from "../../Componets/assets/Contactus.png"; 

const Navbar = () => {
  const [isCareersOpen, setIsCareersOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsCareersOpen(false);
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white text-2xl font-extrabold">LOGO</Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/allListings" className="text-white hover:text-blue-200 transition-colors">Safaris</Link>
          <Link to="/explore-safaris" className="text-white hover:text-blue-200 transition-colors">Explore Safaris</Link>
          <div className="relative dropdown-container">
            <button
              className="text-white hover:text-blue-200 flex items-center"
              onClick={() => setIsCareersOpen(!isCareersOpen)}
            >
              Careers
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`absolute ${isCareersOpen ? "block" : "hidden"} bg-white shadow-lg rounded-md mt-2 z-10`}
            >
              <Link
                to="/LoginForm"
                onClick={() => {
                  setIsCareersOpen(false);
                  navigate("/LoginForm", { state: { role: "guide" } });
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Guide
              </Link>
              <Link
                to="/LoginForm"
                onClick={() => {
                  setIsCareersOpen(false);
                  navigate("/LoginForm", { state: { role: "vehicle_owner" } });
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Vehicle Owner
              </Link>
              <Link
                to="/LoginForm"
                onClick={() => {
                  setIsCareersOpen(false);
                  navigate("/LoginForm", { state: { role: "user" } });
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                User
              </Link>
            </div>
          </div>
          <Link to="/about" className="text-white hover:text-blue-200 transition-colors">About Us</Link>
          <Link to="/maintenance" className="text-white hover:text-blue-200 transition-colors">Blogs</Link>
          <div className="relative dropdown-container">
            <button
              className="text-white hover:text-blue-200 flex items-center"
              onClick={() => setIsAccountOpen(!isAccountOpen)}
            >
              Account
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`absolute ${isAccountOpen ? "block" : "hidden"} bg-white shadow-lg rounded-md mt-2 z-10`}
            >
              <Link
                to="/LoginForm"
                onClick={() => {
                  setIsAccountOpen(false);
                  navigate("/LoginForm");
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Login
              </Link>
              <Link
                to="/RegistrationForm"
                onClick={() => {
                  setIsAccountOpen(false);
                  navigate("/RegistrationForm");
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        <button className="md:hidden text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

const ContactUs = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${Contactus})` }}
    >
      <div className="bg-black bg-opacity-50 min-h-screen text-white p-10">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <div className="text-lg leading-relaxed max-w-3xl mx-auto">
          <p className="mb-4">
          At SafariGo, we’re here to help you every step of the way. Whether you have questions about planning your safari, need support with a booking, or simply want to learn more about our services, our dedicated team is ready to assist you. We value your feedback, suggestions, and inquiries, as they help us improve and serve you better. Reach out to us through phone, email, or by visiting our office — we’d love to hear from you. Your journey into the wild starts with a conversation, and we’re just a message away.


          </p>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
            <p><strong>Address:</strong> No.02 Power Road, Colombo 03, Sri Lanka</p>
            <p><strong>Phone:</strong> 0175-6207</p>
            <p><strong>Email:</strong> <a href="mailto:safarigo@gmail.com" className="underline hover:text-blue-200">safarigo@gmail.com</a></p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-200 mb-4">SafariGo</h3>
            <p className="text-blue-100">
              We are dedicated to making safari bookings, exchange, and management easy. We connect
              travelers with trusted safari operators for a broader, free, and fair wildlife
              experience.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-200 mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/discover" className="text-blue-100 hover:text-blue-200 transition-colors">Discover</Link></li>
              <li><Link to="/about" className="text-blue-100 hover:text-blue-200 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-blue-100 hover:text-blue-200 transition-colors">Blog & Articles</Link></li>
              <li><Link to="/feedback" className="text-blue-100 hover:text-blue-200 transition-colors">Leave Feedback</Link></li>
              <li><Link to="/services" className="text-blue-100 hover:text-blue-200 transition-colors">Services</Link></li>
              <li><Link to="/community" className="text-blue-100 hover:text-blue-200 transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-200 mb-4">Contact</h3>
            <p className="text-blue-100">Address: No.02 Power Road, Colombo 03</p>
            <p className="text-blue-100">Phone: 0175-6207</p>
            <p className="text-blue-100">Email: safarigo@gmail.com</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-blue-200">
          <p>© 2023 SafariGo. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-blue-100 transition-colors">Terms and Conditions</Link>
            <Link to="/privacy" className="hover:text-blue-100 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default Contact;