import React from "react";
import { Logo } from "../assets";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "white",
    top: "0",
    zIndex: "1000",
  };

  const navLinksStyle = {
    display: "flex",
    gap: "20px",
  };

  const navLinkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "20px",
  };

  const buttonStyle = {
    backgroundColor: "white",
    color: "black",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    padding: "10px 15px",
  };

  const accessToken = localStorage.getItem("accessToken");
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userDetails");
    navigate("/login");
  };

  const navigate = useNavigate();
  return (
    <div style={navbarStyle}>
      <img src={Logo} alt="Logo" width={250} height={40} onClick={() => navigate("/")} />
      <div style={navLinksStyle}>
        {userDetails?.userType === "PropertyAgent" ? (
          <>
            <a href="/agent-rooms" style={navLinkStyle}>
              Rooms
            </a>
            <a href="/customer-concerns" style={navLinkStyle}>
              Customer Concerns
            </a>
            <a href="/statistics" style={navLinkStyle}>
              Analytics
            </a>
          </>
        ) : (
          <>
          <a href="/rooms" style={navLinkStyle}>
          Rooms
        </a>
        {accessToken && <a href="/customer-concerns" style={navLinkStyle}>
         Customer Concerns
       </a>}
          </>

        )}
      </div>
      {accessToken ? (
        <button style={buttonStyle} onClick={handleSignOut}>
          Sign Out
        </button>
      ) : (
        <button style={buttonStyle} onClick={() => navigate("/login")}>
          Login
        </button>
      )}
    </div>
  );
};

export default Navbar;
