// Navbar.tsx

import React from "react";
import "./Navbar.css";

type NavbarProps = {
  isUserLoggedIn: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
  isUserLoggedIn,
  onLoginClick,
  onLogoutClick,
}) => (
  <nav className="navbar">
    <h1 className="navbar__title">Canada Music Suppliers & Vendors</h1>
    {isUserLoggedIn ? (
      <button className="navbar__login-button" onClick={onLogoutClick}>
        Logout
      </button>
    ) : (
      <button className="navbar__login-button" onClick={onLoginClick}>
        Login
      </button>
    )}
  </nav>
);

export default Navbar;
