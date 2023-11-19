// VendorSearch.tsx

import { useState } from "react";
import "./VendorSearch.css";
import SearchForm from "../SearchForm/SearchForm";
import VendorsTable, { Vendor } from "../VendorsTable/VendorsTable";

interface VendorSearchProps {
  apiUrl?: string;
}
const VendorSearch: React.FC<VendorSearchProps> = ({ apiUrl }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const baseApiUrl = apiUrl || import.meta.env.VITE_API_BASE_URL;

  const searchVendors = async (searchTerm: string): Promise<void> => {
    try {
      const response = await fetch(
        `${baseApiUrl}/routes/vendors/?search=${searchTerm}`
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

  return (
    <div className="vendor-search">
      <SearchForm onSearch={searchVendors} />
      <VendorsTable vendors={vendors} />
    </div>
  );
};

export default VendorSearch;
