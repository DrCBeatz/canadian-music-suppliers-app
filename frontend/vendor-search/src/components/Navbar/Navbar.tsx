// Navbar.tsx

import React, { useState, useEffect } from "react";
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
}) => {
  const [displayUsername, setDisplayUsername] = useState(username);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isUserLoggedIn && username) {
      setIsFadingOut(false);
      setDisplayUsername(username);
    } else if (!isUserLoggedIn && displayUsername) {
      setIsFadingOut(true);
      const timeoutId = setTimeout(() => {
        setDisplayUsername("");
        setIsFadingOut(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isUserLoggedIn, username, displayUsername]);

  const usernameClass = `navbar__username ${isFadingOut ? "fade-out" : ""}`;

  return (
    <nav className="navbar">
      <h1 className="navbar__title">Canada Music Suppliers & Vendors</h1>
      <div>
        {displayUsername && (
          <span className={usernameClass}>{displayUsername}</span>
        )}
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
};

export default Navbar;
