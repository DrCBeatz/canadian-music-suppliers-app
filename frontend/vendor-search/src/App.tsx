// App.tsx

import React from "react";
import "./App.css";
import VendorSearch from "./components/VendorSearch/VendorSearch";
import Navbar from "./components/Navbar/Navbar";
import Modal from "react-modal";

Modal.setAppElement("#root");

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <VendorSearch />
    </>
  );
};

export default App;
