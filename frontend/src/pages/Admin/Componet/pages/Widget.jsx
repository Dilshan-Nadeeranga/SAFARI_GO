import React from "react";
import "../CSS/Widget.scss";
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Person3OutlinedIcon from '@mui/icons-material/Person3Outlined';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Widget = ({ type }) => {
    let data;

    // Temporary values
    const amount = 100;
    const diff = 20;

    switch (type) {
        case "user":
            data = {
                title: "User",
                isMoney: false,
                link: "View all users",
                icon: <PersonOutlineOutlinedIcon className="icon" 
                style={{color:"crimson",
                backgroundColor: "rgba(255,0,0,0.2)",
                }} />,
            };
            break;
        case "guide":
            data = {
                title: "Guide",
                isMoney: false,
                link: "View all guides",
                icon: <Person3OutlinedIcon className="icon" />,
            };
            break;
        case "package":
            data = {
                title: "Package",
                isMoney: false,
                link: "View all packages",
                icon: <ForestOutlinedIcon className="icon" />,
            };
            break;
        case "vehicle":
            data = {
                title: "Vehicle",
                isMoney: false,
                link: "View all vehicles",
                icon: <DirectionsCarIcon className="icon" />,
            };
            break;
        default:
            break;
    }

    return (
        <div className="widget">
            <div className="left">
                <span className="title">{data.title}</span>
                <span className="counter">
                    {data.isMoney && "$"}{amount}
                </span>
                <span className="link">{data.link}</span>
            </div>
            <div className="right">
                <div className="percentage positive">
                    <KeyboardArrowUpOutlinedIcon />
                    {diff}%
                </div>
                {data.icon}
            </div>
        </div>
    );
};

export default Widget;
