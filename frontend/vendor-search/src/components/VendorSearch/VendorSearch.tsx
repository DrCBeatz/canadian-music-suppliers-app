// VendorSearch.tsx

import { useEffect } from "react";
import "./VendorSearch.css";
import SearchForm from "../SearchForm/SearchForm";
import VendorsTable, { Vendor } from "../VendorsTable/VendorsTable";

interface VendorSearchProps {
  isUserLoggedIn: boolean;
  vendors: Vendor[];
  onSearch: (searchTerm: string) => Promise<void>;
  lastSearchTerm: string;
}

const VendorSearch: React.FC<VendorSearchProps> = ({
  isUserLoggedIn,
  vendors,
  onSearch,
  lastSearchTerm,
}) => {
  
  useEffect(() => {
    if (isUserLoggedIn && lastSearchTerm) {
      onSearch(lastSearchTerm);
    }
  }, [isUserLoggedIn]);
  

  return (
    <div className="vendor-search">
      <SearchForm onSearch={onSearch} />
      <VendorsTable vendors={vendors} isUserLoggedIn={isUserLoggedIn} />
    </div>
  );
};

export default VendorSearch;
