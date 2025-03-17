import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


import LoginForm from "./pages/LoginForm.js"
import Homepage from "./pages/Homepage.js"
import RegistrationForm from "./pages/RegisterForm.js"
import UserHomepage from "./pages/UserHomepage.js"
import UserProfile from "./pages/UserProfile.js"
//Admin
import Dashboard from './pages/Admin/AdminDashboard/Dashboard.jsx';



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
          {/*Admin*/}
          <Route path='/Dashboard' element={<Dashboard/>} />
          
          

          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
