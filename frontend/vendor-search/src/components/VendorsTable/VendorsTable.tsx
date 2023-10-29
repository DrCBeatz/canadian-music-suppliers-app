// VendorsTable.tsx
import React, { useState } from "react";
import Modal from "react-modal";
import "./VendorsTable.css";
import "./VendorsTableModal.css";

export interface Vendor {
  id: number;
  name: string;
  suppliers: {
    name: string;
    contact_name?: string;
    contact_email?: string;
    website?: string;
    phone?: string;
  }[];
  categories: { name: string }[];
}

interface VendorsTableProps {
  vendors: Vendor[];
}

const VendorsTable: React.FC<VendorsTableProps> = ({ vendors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<
    null | Vendor["suppliers"][0]
  >(null);

  const openModal = (supplier: Vendor["suppliers"][0]) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <table className="vendors-table">
        <thead>
          <tr>
            <th className="vendors-table__header-cell">Vendor</th>
            <th className="vendors-table__header-cell">Suppliers</th>
            <th className="vendors-table__header-cell">Categories</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr className="vendors-table__row" key={vendor.id}>
              <td className="vendors-table__cell">{vendor.name}</td>
              <td className="vendors-table__cell">
                {vendor.suppliers.flatMap((supplier, index, array) => {
                  const elements = [];
                  if (
                    supplier.contact_name ||
                    supplier.contact_email ||
                    supplier.website ||
                    supplier.phone
                  ) {
                    elements.push(
                      <span
                        key={supplier.name}
                        onClick={() => openModal(supplier)}
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "underline",
                        }}
                      >
                        {supplier.name}
                      </span>
                    );
                  } else {
                    elements.push(supplier.name);
                  }

                  // If it's not the last supplier, append a comma and a space
                  if (index !== array.length - 1) {
                    elements.push(", ");
                  }
                  return elements;
                })}
              </td>

              <td className="vendors-table__cell">
                {vendor.categories.map((category) => category.name).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Supplier Details"
        className={{
          base: "vendors-table__modal-content",
          afterOpen: "vendors-table__modal-content--after-open",
          beforeClose: "vendors-table__modal-content--before-close",
        }}
        overlayClassName={{
          base: "vendors-table__modal-overlay",
          afterOpen: "vendors-table__modal-overlay--after-open",
          beforeClose: "vendors-table__modal-overlay--before-close",
        }}
      >
        <h2 className="vendors-table__modal-header">{currentSupplier?.name}</h2>
        <p>
          <strong>Contact Name:</strong> {currentSupplier?.contact_name}
        </p>
        <p>
          <strong>Contact Email:</strong> {currentSupplier?.contact_email}
        </p>
        <p>
          <strong>Website: </strong>
          {currentSupplier?.website ? (
            <a
              href={currentSupplier.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {currentSupplier.website}
            </a>
          ) : (
            "-"
          )}
        </p>
        <p>
          <strong>Phone:</strong> {currentSupplier?.phone}
        </p>
        <button
          className="vendors-table__modal-close-button"
          onClick={closeModal}
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default VendorsTable;
