import React from "react";
import "../CSS/Widget.scss";
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Person3OutlinedIcon from '@mui/icons-material/Person3Outlined';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

const Widget = ({ type, count, diff }) => {
    let data;

    switch (type) {
        case "users":
            data = {
                title: "Users",
                isMoney: false,
                link: "View all users",
                icon: <PersonOutlineOutlinedIcon className="icon" 
                style={{color:"crimson",
                backgroundColor: "rgba(255,0,0,0.2)",
                }} />,
            };
            break;
        case "guides":
            data = {
                title: "Guides",
                isMoney: false,
                link: "View all guides",
                icon: <Person3OutlinedIcon className="icon" 
                style={{color:"goldenrod",
                backgroundColor: "rgba(218,165,32,0.2)",
                }} />,
            };
            break;
        case "vehicle-owners":
            data = {
                title: "Vehicle Owners",
                isMoney: false,
                link: "View all vehicle owners",
                icon: <DirectionsCarIcon className="icon" 
                style={{color:"green",
                backgroundColor: "rgba(0,128,0,0.2)",
                }} />,
            };
            break;
        case "bookings":
            data = {
                title: "Bookings",
                isMoney: false,
                link: "View all bookings",
                icon: <ListAltOutlinedIcon className="icon" 
                style={{color:"purple",
                backgroundColor: "rgba(128,0,128,0.2)",
                }} />,
            };
            break;
        default:
            // Provide default data to prevent errors
            data = {
                title: "Unknown",
                isMoney: false,
                link: "View details",
                icon: <PersonOutlineOutlinedIcon className="icon" />,
            };
            break;
    }

    return (
        <div className="widget">
            <div className="left">
                <span className="title">{data.title}</span>
                <span className="counter">
                    {data.isMoney && "$"}{count || 0}
                </span>
                <span className="link">{data.link}</span>
            </div>
            <div className="right">
                <div className="percentage positive">
                    <KeyboardArrowUpOutlinedIcon />
                    {diff || 0}%
                </div>
                {data.icon}
            </div>
        </div>
    );
};

export default Widget;
