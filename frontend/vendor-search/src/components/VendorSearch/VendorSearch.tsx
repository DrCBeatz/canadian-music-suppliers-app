// VendorSearch.tsx

import { useEffect } from "react";
import "./VendorSearch.css";
import SearchForm from "../SearchForm/SearchForm";
import VendorsTable, { Vendor } from "../VendorsTable/VendorsTable";
import Modal from "react-modal";

Modal.setAppElement(document.createElement("div"));

interface VendorSearchProps {
  isUserLoggedIn: boolean;
  vendors: Vendor[];
  onSearch: (searchTerm: string) => Promise<void>;
  lastSearchTerm: string;
  errorMessage: string;
  clearErrorMessage: () => void;
}

const VendorSearch: React.FC<VendorSearchProps> = ({
  isUserLoggedIn,
  vendors,
  onSearch,
  lastSearchTerm,
  errorMessage,
  clearErrorMessage,
}) => {
  useEffect(() => {
    if (isUserLoggedIn && lastSearchTerm) {
      onSearch(lastSearchTerm).catch((error) => {
        console.error("Search error: ", error);
      });
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    if (errorMessage) {
      clearErrorMessage();
    }
  }, [lastSearchTerm]);

  return (
    <div className="vendor-search">
      <SearchForm onSearch={onSearch} />
      <VendorsTable vendors={vendors} isUserLoggedIn={isUserLoggedIn} />
      {errorMessage && (
        <div className="vendor-search__error-message">{errorMessage}</div>
      )}
    </div>
  );
};

export default VendorSearch;
