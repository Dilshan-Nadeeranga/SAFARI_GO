import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Aboutus from "../../Componets/assets/Aboutus.png";

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

const AboutUs = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${Aboutus})` }}
    >
      <div className="bg-black bg-opacity-50 min-h-screen text-white p-10">
        <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto">
        At SafariGo, we are passionate about connecting travelers with unforgettable wildlife and nature experiences across Sri Lanka. As a trusted online safari booking platform, we make it easy to discover, plan, and reserve safaris in the island’s most iconic national parks and nature reserves — from leopard-spotting in Yala to dolphin watching in Mirissa.
            Our carefully curated selection of tours includes jeep safaris, boat rides, walking treks, and eco-adventures led by experienced, licensed guides. Whether you're seeking a half-day excursion or a full wilderness journey, we ensure every trip is safe, authentic, and hassle-free.

            Backed by local expertise and a love for conservation, our mission is to promote responsible travel while giving you seamless access to Sri Lanka’s incredible biodiversity. Book with confidence, travel with purpose, and experience nature like never before.

            We are deeply committed to sustainable and responsible tourism. That’s why we partner with locally owned safari operators, naturalists, and conservation-focused organizations to ensure every tour we offer not only delivers an exceptional guest experience but also supports the communities and ecosystems involved. A portion of our proceeds goes toward wildlife conservation and community development initiatives, helping to preserve Sri Lanka’s rich biodiversity and empower those who call these natural areas home. When you book with us, you're not just planning a trip — you're actively contributing to the protection of nature and the well-being of local livelihoods.


        </p>
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

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default About;