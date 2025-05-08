import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from "./pages/LoginForm.js";
import Homepage from "./pages/Homepage.js";
import RegistrationForm from "./pages/RegisterForm.js";
import UserHomepage from "./pages/UserHomepage.js";
import UserProfile from "./pages/User/UserProfile.js";
import UserLayout from "./pages/User/UserLayout.js";
import UserDashboard from "./pages/User/UserDashboard.js";
import UserTrips from "./pages/User/UserTrips.js";
import UserSubscriptions from "./pages/User/UserSubscriptions.js";
import UserSettings from "./pages/User/UserSettings.js";
import UserSafaris from './pages/User/UserSafaris';
import PublicSafaris from './pages/PublicSafaris';
import BookSafari from './pages/BookSafari';



import UserFeedback from './pages/User/UserFeedback'; // Add this new import
import AllVehicles from './pages/Vehicle/AllVehicles'; // Add this import
import VehicleDetails from './pages/Vehicle/VehicleDetails'; // Add this import
import RentVehicle from './pages/Vehicle/RentVehicle'; // Add this import
import UserRentals from './pages/User/UserRentals'; // Add this import

import AboutUs from './pages/AboutUs/About.js';// Add this import 
import Contact from './pages/ContactUs/Contact.js'; // Add this import


import SafariPlanner from './pages/User/SafariPlanner.js';
import Blog from './pages/Blog/blog.js'; // Add this import
// Admin
import Dashboard from './pages/Admin/AdminDashboard/Dashboard.jsx';
import UsersList from './pages/Admin/List/UsersList';
import UserEdit from './pages/Admin/Edit/UserEdit';
import GuidesList from './pages/Admin/List/GuidesList';
import VehicleOwnersList from './pages/Admin/List/VehicleOwnersList';
import AdminVehiclesList from './pages/Admin/List/AdminVehiclesList';
import AdminPackagesList from './pages/Admin/List/AdminPackagesList';
import AdminNotifications from './pages/Admin/Notifications/AdminNotifications';
import AdminBookingHistory from './pages/Admin/Reports/AdminBookingHistory';
import AdminBookingHistoryRevenueFix from './pages/Admin/Reports/AdminBookingHistoryRevenueFix';
import AdminFeedbackManagement from './pages/Admin/Feedback/AdminFeedbackManagement';
import AdminFeedbackReport from './pages/Admin/Feedback/AdminFeedbackReport';
import PremiumSubscribers from './pages/Admin/PremiumSubscribers';
import AdminBookingDetails from './pages/Admin/Booking/AdminBookingDetails';
import VehicleOwnerEdit from './pages/Admin/Edit/VehicleOwnerEdit';

// Guide
import GuideDashboard from './pages/Guide/GuideDashboard.js';
import GuideFeedback from './pages/Guide/GuideFeedback';

// Vehicle
import VehicleOwnerDashboard from './pages/Vehicle/VehicleOwnerDashboard.js';
import AddVehicle from './pages/Vehicle/AddVehicle.js';

// Components
import FeedbackForm from './Componets/FeedbackForm';

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          <Route path="/RegistrationForm" element={<RegistrationForm />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/LoginForm" element={<LoginForm />} />
          <Route path="/UserHomepage" element={<UserHomepage />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/explore-safaris" element={<PublicSafaris />} />
          <Route path="/BookSafari" element={<BookSafari />} />

           
          <Route path="/blog" element={<Blog />} /> {/* Updated to /blog */}

          <Route path="/about" element={<AboutUs />} /> {/* Updated to /about */}
          <Route path="/contact" element={<Contact />} /> {/* Updated to /contact */}
          

          <Route path="/vehicles" element={<AllVehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/rent-vehicle" element={<RentVehicle />} />
          
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="trips" element={<UserTrips />} />
            <Route path="rentals" element={<UserRentals />} />
            <Route path="subscriptions" element={<UserSubscriptions />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="safaris" element={<UserSafaris />} />
            <Route path="feedback" element={<UserFeedback />} />
            <Route path="planner" element={<SafariPlanner />} />
          </Route>
          
          {/* Admin */}
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path='/admin/users' element={<UsersList />} />
          <Route path='/admin/users/:userId' element={<UserEdit />} />
          <Route path='/admin/guides' element={<GuidesList />} />
          <Route path='/admin/vehicle-owners' element={<VehicleOwnersList />} />
          <Route path='/admin/vehicles' element={<AdminVehiclesList />} />
          <Route path='/admin/packages' element={<AdminPackagesList />} />
          <Route path='/admin/notifications' element={<AdminNotifications />} />
          <Route path='/admin/booking-history' element={<AdminBookingHistory />} />
          <Route path='/admin/booking-revenue' element={<AdminBookingHistoryRevenueFix />} />
          <Route path='/admin/booking-details/:bookingId' element={<AdminBookingDetails />} />
          <Route path='/admin/premium-subscribers' element={<PremiumSubscribers />} />
          <Route path='/admin/vehicle-owners/:ownerId' element={<VehicleOwnerEdit />} />
          <Route path='/admin/feedback' element={<AdminFeedbackManagement />} />
          <Route path='/admin/feedback-report' element={<AdminFeedbackReport />} />
          <Route path="/GuideDashboard" element={<GuideDashboard />} />
          <Route path="/guide-feedback" element={<GuideFeedback />} />
          <Route path="/VehicleOwnerDashboard" element={<VehicleOwnerDashboard />} />
          <Route path="/AddVehicle" element={<AddVehicle />} />
          <Route path="/feedback" element={<FeedbackForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;