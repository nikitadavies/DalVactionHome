import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BannerImage } from "../../assets";
import { RoomSection } from "../RoomSection/RoomSection";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    setUserDetails(userDetails);
  }, []);

  const backgroundStyle = {
    position: "relative",
    height: "80vh",
    backgroundImage: `url(${BannerImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    margin: "0",
    backgroundColor: "#ffffff",
  };

  const overlayTextStyle = {
    position: "absolute",
    top: "40%",
    left: "20%",
    transform: "translate(-50%, -50%)",
    color: "white",
    textAlign: "left",
  };

  const headingStyle = {
    fontSize: "2em",
    margin: "0",
  };

  const paragraphStyle = {
    fontSize: "1.5em",
    margin: "10px 0 0",
  };

  const searchContainerStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  };

  const buttonStyle = {
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#FF9900',
    color: 'white',
    cursor: 'pointer',
    width: '200px',
    height: '40px'
  };

  const onClickAvailability = () => {
    navigate("/rooms");
  }

  return (
    <>
      <div style={backgroundStyle}>
        <div style={overlayTextStyle}>
          <h1 style={headingStyle}>Your Perfect Getaway Awaits</h1>
          <p style={paragraphStyle}>
            Luxurious comfort in the heart of nature.
          </p>
        </div>
        <div style={searchContainerStyle}>
          <input type="text" placeholder="Check In" style={inputStyle} />
          <input type="text" placeholder="Check Out" style={inputStyle} />
          <select style={inputStyle}>
            <option>Suite</option>
            <option>Presidential</option>
            <option>Deluxe</option>
            <option>Recreational Room</option>
          </select>
          <button style={buttonStyle} onClick={onClickAvailability}>
            Check Availability
          </button>
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <RoomSection />
      </div>
    </>
  );
};
