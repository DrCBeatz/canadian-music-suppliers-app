// Navbar.tsx

import React from "react";
import "./Navbar.css";

type NavbarProps = {
  onLoginClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => (
  <nav className="navbar">
    <h1 className="navbar__title">Canada Music Suppliers & Vendors</h1>
    <button className="navbar__login-button" onClick={onLoginClick}>
      Login
    </button>
  </nav>
);

export default Navbar;
