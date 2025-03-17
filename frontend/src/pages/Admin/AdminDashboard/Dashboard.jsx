import React from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar"; // Fixed import path
import Navbar from "./Navbar";
import Widget from "../Componet/pages/Widget"

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
            </div>
        </div>
    );
};

export default Dashboard;
