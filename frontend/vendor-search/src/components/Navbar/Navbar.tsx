// Navbar.tsx

import React from "react";
import "./Navbar.css";

type NavbarProps = {
  isUserLoggedIn: boolean;
  username?: string;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
  isUserLoggedIn,
  username,
  onLoginClick,
  onLogoutClick,
}) => (
  <nav className="navbar">
    <h1 className="navbar__title">Canada Music Suppliers & Vendors</h1>

    <div>
      {username && <span className="navbar__username">{username}</span>}
      {isUserLoggedIn ? (
        <button
          className="navbar__login-button"
          data-testid="navbar-login-button"
          onClick={onLogoutClick}
        >
          Logout
        </button>
      ) : (
        <button
          className="navbar__login-button"
          data-testid="navbar-login-button"
          onClick={onLoginClick}
        >
          Login
        </button>
      )}
    </div>
  </nav>
);

export default Navbar;
