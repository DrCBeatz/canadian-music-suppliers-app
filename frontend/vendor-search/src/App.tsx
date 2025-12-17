// App.tsx

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import VendorSearch from "./components/VendorSearch/VendorSearch";
import LoginModal from "./components/LoginModal/LoginModal";
import "./App.css";
import Modal from "react-modal";
import { getCsrfToken } from "./utils/csrf";
import { Vendor } from "./components/VendorsTable/VendorsTable";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function isPaginated<T>(data: any): data is PaginatedResponse<T> {
  return (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as any).results) &&
    typeof (data as any).count === "number"
  );
}

const App: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loginModalKey, setLoginModalKey] = useState(0);
  const [username, setUsername] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const PAGE_SIZE = 25;

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

  async function fetchCsrfToken() {
    const response = await fetch("http://localhost:8000/get-csrf/", {
      credentials: "include", // Necessary to include cookies
    });
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    }
    throw new Error("Failed to fetch CSRF token");
  }

  const searchVendors = async (
    searchTerm: string,
    pageToFetch: number = 1
  ): Promise<void> => {
    const isNewSearch = searchTerm !== lastSearchTerm;

    
    if (isNewSearch) {
      setPage(1);
      setTotalCount(0);
      setHasNext(false);
      setHasPrev(false);
    }

    setLastSearchTerm(searchTerm);
    setSearchError("");
    setIsLoading(true);
    setVendors([]);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);

      params.set("page", String(pageToFetch));
      params.set("page_size", String(PAGE_SIZE));

      const response = await fetch(
        `${baseApiUrl}/routes/vendors/?${params.toString()}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (Array.isArray(data)) {
        setVendors(data as Vendor[]);
        setTotalCount((data as Vendor[]).length);
        setHasNext(false);
        setHasPrev(false);
        setPage(1);
      } else if (isPaginated<Vendor>(data)) {
        setVendors(data.results);
        setTotalCount(data.count);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
        setPage(pageToFetch);
      } else {
        // Defensive fallback
        setVendors([]);
        setTotalCount(0);
        setHasNext(false);
        setHasPrev(false);
        setPage(1);
      }
    } catch (e) {
      setSearchError("Failed to load vendors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== "test") {
      Modal.setAppElement("#root");
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken()
      .then((token) => {
        console.log(token);
      })
      .catch((error) => {
        console.error("Error fetching CSRF token:", error);
      });
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
        errorMessage={searchError}
        clearErrorMessage={() => setSearchError("")}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalCount,
          hasNext,
          hasPrev,
          onPrev: () => {
            if (page > 1) searchVendors(lastSearchTerm, page - 1);
          },
          onNext: () => {
            if (hasNext) searchVendors(lastSearchTerm, page + 1);
          },
        }}
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
