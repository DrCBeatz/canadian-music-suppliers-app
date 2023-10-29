// App.tsx

import React from "react";
import "./App.css";
import VendorSearch from "./components/VendorSearch/VendorSearch";
import Modal from "react-modal";

Modal.setAppElement('#root');

const App: React.FC = () => {
  return (
    <>
      <VendorSearch />
    </>
  );
};

export default App;
