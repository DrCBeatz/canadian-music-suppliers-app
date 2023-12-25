// App.tsx

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import VendorSearch from "./components/VendorSearch/VendorSearch";
import LoginModal from "./components/LoginModal/LoginModal";
import "./App.css";
import Modal from "react-modal";
import { getCsrfToken } from "./utils/csrf";
import { Vendor } from "./components/VendorsTable/VendorsTable";

const App: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loginModalKey, setLoginModalKey] = useState(0);
  const [username, setUsername] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

  const searchVendors = async (searchTerm: string): Promise<void> => {
    setLastSearchTerm(searchTerm);
    try {
      const response = await fetch(
        `${baseApiUrl}/routes/vendors/?search=${searchTerm}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Vendor[] = await response.json();
      setVendors(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching data: ", error);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== "test") {
      Modal.setAppElement("#root");
    }
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    // Wait for the closing animation to finish before remounting
    setTimeout(() => {
      setLoginModalKey((prevKey) => prevKey + 1);
    }, 300);
  };

  const handleLoginSuccess = (username: string) => {
    setIsUserLoggedIn(true);
    setUsername(username);
    setIsLoginModalOpen(false);
    if (lastSearchTerm) {
      searchVendors(lastSearchTerm);
    }

    setTimeout(() => {
      setLoginModalKey((prevKey) => prevKey + 1);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
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
        setUsername("");
        setIsUserLoggedIn(false);
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
        username={username}
        onLoginClick={openLoginModal}
        onLogoutClick={handleLogout}
      />
      <VendorSearch
        isUserLoggedIn={isUserLoggedIn}
        vendors={vendors}
        lastSearchTerm={lastSearchTerm}
        onSearch={searchVendors}
      />
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
