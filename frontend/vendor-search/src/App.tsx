// App.tsx

import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import VendorSearch from "./components/VendorSearch/VendorSearch";
import LoginModal from "./components/LoginModal/LoginModal";
import "./App.css";
import Modal from "react-modal";

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

  const handleLogout = () => {
    setIsUserLoggedIn(false);
    // Clear any stored tokens or user data here
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
