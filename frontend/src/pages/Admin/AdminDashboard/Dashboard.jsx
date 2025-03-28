//frontend/src/pages/Admin/AdminDashboard/Dashboard.jsx
import React from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Widget from "../Componet/pages/Widget";
import Notifications from "./Notifications";
import UsersList from "../List/UsersList";

const Dashboard = () => {
  return (
    <div className="homedach">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget type="user" />
          <Widget type="guide" />
          <Widget type="package" />
          <Widget type="vehicle" />
        </div>
        <div className="notifications-container">
          <Notifications />
        </div>
        <div className="users-list-container">
          <UsersList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;