// VendorSearch.tsx

import { useEffect } from "react";
import "./VendorSearch.css";
import SearchForm from "../SearchForm/SearchForm";
import VendorsTable, { Vendor } from "../VendorsTable/VendorsTable";
import Modal from "react-modal";
import PaginationControls, {
  PaginationControlsProps,
} from "../PaginationControls/PaginationControls";

Modal.setAppElement(document.createElement("div"));

interface VendorSearchProps {
  isUserLoggedIn: boolean;
  vendors: Vendor[];
  onSearch: (searchTerm: string) => Promise<void>;
  lastSearchTerm: string;
  errorMessage: string;
  clearErrorMessage: () => void;
  isLoading?: boolean;
  pagination?: Omit<PaginationControlsProps, "isLoading">;
}

const VendorSearch: React.FC<VendorSearchProps> = ({
  isUserLoggedIn,
  vendors,
  onSearch,
  lastSearchTerm,
  errorMessage,
  clearErrorMessage,
  isLoading = false,
  pagination
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

  const initialEmptyState =
    !isLoading && !errorMessage && !lastSearchTerm ? (
      <div className="empty-state" role="note" aria-label="Vendor search instructions">
        <h3 className="empty-state__title">Search vendors to get started.</h3>

        <ul className="empty-state__list">
          <li>Type a vendor name to see suppliers and categories.</li>
          <li>Click a supplier for contact details.</li>
        </ul>

        {!isUserLoggedIn && (
          <p className="empty-state__hint">Log in to view additional fields.</p>
        )}
      </div>
    ) : undefined;

  const noResultsMessage =
    !isLoading && !errorMessage && lastSearchTerm && vendors.length === 0 ? (
      <>
        No results for{" "}
        <span className="vendors-table__empty-state-term">"{lastSearchTerm}"</span>.
        <div style={{ marginTop: 8, opacity: 0.8 }}>
          Try a different spelling or a broader search.
        </div>
      </>
    ) : undefined;

  const emptyState = noResultsMessage ?? initialEmptyState;

  const showPagination = Boolean(pagination) && !errorMessage && !isLoading;

  return (
  <div className="vendor-search">
    <SearchForm onSearch={onSearch} />

    <VendorsTable
      vendors={vendors}
      isUserLoggedIn={isUserLoggedIn}
      isLoading={isLoading}
      emptyState={emptyState}
    />

    {showPagination && <PaginationControls {...pagination!} />}

    {errorMessage && (
      <div className="vendor-search__error-message">{errorMessage}</div>
    )}
  </div>
);
};

export default VendorSearch;