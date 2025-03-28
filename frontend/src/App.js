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
// Admin
import Dashboard from './pages/Admin/AdminDashboard/Dashboard.jsx';
// Guide
import GuideDashboard from './pages/Guide/GuideDashboard.js';


//aloka
import VehicleOwnerDashboard from "./pages/Vehicle/VehicleOwnerDashboard";
import VehicleOwnerProfile from "./pages/Vehicle/VehicleOwnerProfile.js";
import MyVehicles from "./pages/Vehicle/MyVehicles";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/LoginForm" element={<LoginForm />} />
          <Route path="/RegistrationForm" element={<RegistrationForm />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/UserHomepage" element={<UserHomepage />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="trips" element={<UserTrips />} />
            <Route path="subscriptions" element={<UserSubscriptions />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
          {/* Admin */}
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path="/GuideDashboard" element={<GuideDashboard />} />
          <Route path="/VehicleOwnerDashboard" element={<VehicleOwnerDashboard />} />
          {/*Alok*/}
          <Route path="/vehicle-owner/profile" element={<VehicleOwnerProfile />} />
          <Route path="/vehicle-owner/vehicles" element={<MyVehicles />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;