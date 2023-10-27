// VendorSearch.tsx

import { useState } from "react";
import "./VendorSearch.css";
import AppHeader from "../AppHeader/AppHeader";
import SearchForm from "../SearchForm/SearchForm";
import VendorsTable from "../VendorsTable/VendorsTable";

let apiUrl: string;

if (process.env.NODE_ENV === "development") {
  apiUrl = "http://localhost:8000";
} else {
  apiUrl = "https://secure-falls-59693-7d816c7f067e.herokuapp.com";
}

const VendorSearch = () => {
  const [vendors, setVendors] = useState([]);

  const searchVendors = async (searchTerm: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/routes/vendors/?search=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
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
