// VendorsTable.tsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./VendorsTable.css";
import "./VendorsTableModal.css";

export interface Supplier {
  name: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  website?: string;
  phone?: string;
  max_delivery_time?: string;
  minimum_order_amount?: string;
  notes?: string;
  shipping_fees?: string;
  accounting_email?: string;
  accounting_contact?: string;
  account_number?: string;
  account_active?: boolean;
  website_username?: string;
  website_password?: string;
}

export interface Vendor {
  id: number;
  name: string;
  suppliers: Supplier[];
  categories: { name: string }[];
}

interface VendorsTableProps {
  vendors: Vendor[];
  isUserLoggedIn: boolean;
}

const VendorsTable: React.FC<VendorsTableProps> = ({
  vendors,
  isUserLoggedIn,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<
    null | Vendor["suppliers"][0]
  >(null);

  console.log("VendorsTable props - vendors:", vendors, "isUserLoggedIn:", isUserLoggedIn);

  useEffect(() => {
    setCurrentSupplier(null);
  }, [vendors]);

  const renderField = (
    label: string,
    value: string | boolean | null | undefined
  ) => {
    if (value || value === false) {
      // Checks for non-null, non-undefined, and non-empty string. Also, explicitly allows boolean false.
      return (
        <p>
          <strong>{label}:</strong> {value.toString()}
        </p>
      );
    }
    return null;
  };

  const openModal = (supplier: Vendor["suppliers"][0]) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  console.log("Is User Logged In: ", isUserLoggedIn);
  console.log("Current Supplier: ", currentSupplier);
  {console.log("Mapping vendors:", vendors)};        
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
          {vendors.map((vendor) => ( // ***
            <tr className="vendors-table__row" key={vendor.id}>
              <td className="vendors-table__cell">{vendor.name}</td>
              <td className="vendors-table__cell">
                {vendor.suppliers.flatMap((supplier, index, array) => {
                  const elements = [];
                  if (
                    supplier.primary_contact_name ||
                    supplier.primary_contact_email ||
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
        closeTimeoutMS={300}
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
          <strong>Contact Name:</strong> {currentSupplier?.primary_contact_name}
        </p>
        <p>
          <strong>Contact Email:</strong>{" "}
          {currentSupplier?.primary_contact_email}
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

        {isUserLoggedIn && currentSupplier && (
          <>
            {renderField(
              "Minimum Order Amount",
              currentSupplier.minimum_order_amount
            )}
            {renderField("Notes", currentSupplier.notes)}
            {renderField("Shipping Fees", currentSupplier.shipping_fees)}
            {renderField(
              "Max Delivery Time",
              currentSupplier.max_delivery_time
            )}
            {renderField("Accounting Email", currentSupplier.accounting_email)}
            {renderField(
              "Accounting Contact",
              currentSupplier.accounting_contact
            )}
            {renderField("Accounting Number", currentSupplier.account_number)}
            {renderField("Account Active", currentSupplier.account_active)}
            {renderField("Website Username", currentSupplier.website_username)}
            {renderField("Website Passwrod", currentSupplier.website_password)}
          </>
        )}

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
