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

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    closeLoginModal();
  };

  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      await fetch(`${apiUrl}/api/logout/`, {
        method: "POST",
        credentials: "include", // To include cookies in the request
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, // Include the CSRF token in the request
        },
      });
      setIsUserLoggedIn(false);
      console.log("Logout successful");
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
        isOpen={isLoginModalOpen}
        onRequestClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default App;
