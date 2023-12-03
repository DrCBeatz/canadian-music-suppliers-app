// App.tsx

import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import VendorSearch from "./components/VendorSearch/VendorSearch";
import LoginModal from "./components/LoginModal/LoginModal";
import "./App.css";
import Modal from "react-modal";
import { getCsrfToken } from "./utils/csrf";

Modal.setAppElement("#root");

const App: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loginModalKey, setLoginModalKey] = useState(0);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    // Wait for the closing animation to finish before remounting
    setTimeout(() => {
      setLoginModalKey((prevKey) => prevKey + 1);
    }, 300);
  };

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    setIsLoginModalOpen(false);

    setTimeout(() => {
      setLoginModalKey((prevKey) => prevKey + 1);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      console.log("CSRF Token during logout:", csrfToken); // Log the CSRF token
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${apiUrl}/api/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
      if (response.ok) {
        setIsUserLoggedIn(false);
        console.log("Logout successful");
      } else {
        console.error(
          "Logout failed: Server responded with status",
          response.status
        );
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <Navbar
        isUserLoggedIn={isUserLoggedIn}
        onLoginClick={openLoginModal}
        onLogoutClick={handleLogout}
      />
      <VendorSearch />
      <LoginModal
        key={loginModalKey}
        isOpen={isLoginModalOpen}
        onRequestClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default App;
