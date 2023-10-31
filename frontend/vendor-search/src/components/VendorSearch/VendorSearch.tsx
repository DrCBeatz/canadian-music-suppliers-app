// VendorSearch.tsx

import { useState } from "react";
import "./VendorSearch.css";
import AppHeader from "../AppHeader/AppHeader";
import SearchForm from "../SearchForm/SearchForm";
import VendorsTable, { Vendor } from "../VendorsTable/VendorsTable";

let apiUrl: string;

if (process.env.NODE_ENV === "development") {
  apiUrl = "http://localhost:8000";
} else {
  apiUrl = "https://secure-falls-59693-7d816c7f067e.herokuapp.com";
}

const VendorSearch: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const searchVendors = async (searchTerm: string): Promise<void> => {
    console.log(
      `Fetching data from: ${apiUrl}/routes/vendors/?search=${searchTerm}`
    );

    try {
      const response = await fetch(
        `${apiUrl}/routes/vendors/?search=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Vendor[] = await response.json();

      console.log("Fetched data:", data);
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
      <AppHeader />
      <SearchForm onSearch={searchVendors} />
      <VendorsTable vendors={vendors} />
    </div>
  );
};

export default VendorSearch;
