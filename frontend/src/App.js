import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LoginForm from "./pages/LoginForm.js";
import Homepage from "./pages/Homepage.js";
import RegistrationForm from "./pages/RegisterForm.js";
import UserHomepage from "./pages/UserHomepage.js";
import UserProfile from "./pages/User/UserProfile.js"
import UserLayout from "./pages/User/UserLayout.js";
import UserDashboard from "./pages/User/UserDashboard.js";
import UserTrips from "./pages/User/UserTrips.js";
import UserSubscriptions from "./pages/User/UserSubscriptions.js";
import UserSettings from "./pages/User/UserSettings.js";
import UserSafaris from './pages/User/UserSafaris';
import UserVehicle from './pages/User/UserVehicle.js'
import PublicSafaris from './pages/PublicSafaris';
import BookSafari from './pages/BookSafari';

// Admin
import Dashboard from './pages/Admin/AdminDashboard/Dashboard.jsx';
import UsersList from './pages/Admin/List/UsersList';
import GuidesList from './pages/Admin/List/GuidesList';
import VehicleOwnersList from './pages/Admin/List/VehicleOwnersList';
import AdminVehiclesList from './pages/Admin/List/AdminVehiclesList';
import AdminNotifications from './pages/Admin/Notifications/AdminNotifications';
import AdminBookingHistory from './pages/Admin/Reports/AdminBookingHistory';
import AdminFeedbackManagement from './pages/Admin/Feedback/AdminFeedbackManagement';
import AdminFeedbackReport from './pages/Admin/Feedback/AdminFeedbackReport';

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
        <Routes>
          <Route path="/RegistrationForm" element={<RegistrationForm />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/LoginForm" element={<LoginForm />} /> {/* Add this missing route */}
          <Route path="/UserHomepage" element={<UserHomepage />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/explore-safaris" element={<PublicSafaris />} />
          <Route path="/BookSafari" element={<BookSafari />} />
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="trips" element={<UserTrips />} />
            <Route path="subscriptions" element={<UserSubscriptions />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="safaris" element={<UserSafaris />} />
            <Route path="vehicle" element={<UserVehicle />} />
          </Route>
          {/* Admin */}
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path='/admin/users' element={<UsersList />} />
          <Route path='/admin/guides' element={<GuidesList />} />
          <Route path='/admin/vehicle-owners' element={<VehicleOwnersList />} />
          <Route path='/admin/vehicles' element={<AdminVehiclesList />} />
          <Route path='/admin/notifications' element={<AdminNotifications />} />
          <Route path='/admin/booking-history' element={<AdminBookingHistory />} />
          {/* Feedback Management Routes */}
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