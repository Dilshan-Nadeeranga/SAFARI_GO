import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import blogImage from "../../Componets/assets/blog.jpg";

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
        <a href="/" className="text-white text-2xl font-extrabold">LOGO</a>
        <div className="hidden md:flex items-center space-x-6">
          <a href="/allListings" className="text-white hover:text-blue-200 transition-colors">Safaris</a>
          <a href="/explore-safaris" className="text-white hover:text-blue-200 transition-colors">Explore Safaris</a>
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
              <a
                href="/LoginForm"
                onClick={() => {
                  setIsCareersOpen(false);
                  navigate("/LoginForm", { state: { role: "guide" } });
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Guide
              </a>
              <a
                href="/LoginForm"
                onClick={() => {
                  setIsCareersOpen(false);
                  navigate("/LoginForm", { state: { role: "vehicle_owner" } });
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Vehicle Owner
              </a>
              <a
                href="/LoginForm"
                onClick={() => {
                  setIsCareersOpen(false);
                  navigate("/LoginForm", { state: { role: "user" } });
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                User
              </a>
            </div>
          </div>
          <a href="/" className="text-white hover:text-blue-200 transition-colors">About Us</a>
          <a href="/maintenance" className="text-white hover:text-blue-200 transition-colors">Blogs</a>
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
              <a
                href="/LoginForm"
                onClick={() => {
                  setIsAccountOpen(false);
                  navigate("/LoginForm");
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Login
              </a>
              <a
                href="/RegistrationForm"
                onClick={() => {
                  setIsAccountOpen(false);
                  navigate("/RegistrationForm");
                }}
                className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
              >
                Register
              </a>
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

const BlogArticles = () => {
  // Sample article data with image paths in the public folder
  const articles = [
    { 
      id: 1, 
      title: "Top 10 Safari Destinations", 
      date: "May 05, 2025", 
      excerpt: "Explore the best safari spots around the world...", 
      link: "/article1", 
      image: "/assets/blog1.png" 
    },
    { 
      id: 2, 
      title: "Wildlife Photography Tips", 
      date: "May 04, 2025", 
      excerpt: "Learn how to capture stunning wildlife photos...", 
      link: "/article2", 
      image: "/assets/blog2.png" 
    },
    { 
      id: 3, 
      title: "Safari Packing Guide", 
      date: "May 03, 2025", 
      excerpt: "Essential items to pack for your safari adventure...", 
      link: "/article/3", 
      image: "/assets/blog3.png" 
    },
    { 
      id: 4, 
      title: "Conservation Efforts in Africa", 
      date: "May 02, 2025", 
      excerpt: "Discover how conservation is protecting wildlife...", 
      link: "/article/4", 
      image: "/assets/blog4.png" 
    },
    { 
      id: 5, 
      title: "Best Safari Vehicles", 
      date: "May 01, 2025", 
      excerpt: "A look at the top vehicles for safari experiences...", 
      link: "/article/5", 
      image: "/assets/article5.jpeg" 
    },
    { 
      id: 6, 
      title: "Night Safari Experiences", 
      date: "April 30, 2025", 
      excerpt: "What to expect on a thrilling night safari...", 
      link: "/article/6", 
      image: "/assets/article6.png" 
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${blogImage})` }}
    >
      <div className="bg-black bg-opacity-50 min-h-screen text-white p-10">
        <h1 className="text-4xl font-bold mb-6 text-center">Blog & Articles</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {articles.map((article) => (
            <div key={article.id} className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover rounded-md mb-4"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x150?text=Image+Not+Found";
                  e.target.alt = "Image failed to load";
                }}
              />
              <h2 className="text-xl font-semibold text-blue-200 mb-2">{article.title}</h2>
              <p className="text-sm text-gray-300 mb-2">{article.date}</p>
              <p className="text-gray-100 mb-4">{article.excerpt}</p>
              <Link to={article.link} className="text-blue-300 hover:text-blue-100 underline">
                Read More
              </Link>
            </div>
          ))}
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

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <BlogArticles />
      <Footer />
    </div>
  );
};

export default Blog;