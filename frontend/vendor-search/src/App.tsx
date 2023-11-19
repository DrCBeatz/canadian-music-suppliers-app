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

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <>
      <Navbar onLoginClick={openLoginModal} />
      <VendorSearch />
      <LoginModal isOpen={isLoginModalOpen} onRequestClose={closeLoginModal} />
    </>
  );
};

export default App;
