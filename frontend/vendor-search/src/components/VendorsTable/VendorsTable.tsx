// VendorsTable.tsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./VendorsTable.css";
import "./VendorsTableModal.css";
import ToolTip from "../ToolTip/ToolTip";

export interface Contact {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

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
  additional_contacts?: Contact[];
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
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

const VendorsTable: React.FC<VendorsTableProps> = ({
  vendors,
  isUserLoggedIn,
  isLoading = false,
  emptyState,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<
    null | Vendor["suppliers"][0]
  >(null);

  useEffect(() => {
    // If the results change (new search), clear the current modal supplier.
    // Optionally you can also close the modal here:
    // setIsModalOpen(false);
    setCurrentSupplier(null);
  }, [vendors]);

  const shouldShowToolTip = (supplier: Supplier) => {
    return (
      isUserLoggedIn && !!supplier.website_username && !!supplier.website_password
    );
  };

  const renderField = (
    label: string,
    value: string | boolean | null | undefined
  ) => {
    if (value || value === false) {
      return (
        <p>
          <strong>{label}:</strong> {value.toString()}
        </p>
      );
    }
    return null;
  };

  const renderAdditionalContacts = (contacts?: Contact[]) => {
    if (!contacts || contacts.length === 0) return null;
    return (
      <div className="vendors-table__additional-contacts">
        <strong>Additional Contacts:</strong>
        <ul className="vendors-table__additional-contacts__list">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className="vendors-table__additional-contacts__list-item"
            >
              <strong>Name: </strong>
              {contact.name} - <strong>Email: </strong>
              {contact.email} - <strong>Role: </strong>({contact.role})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const openModal = (supplier: Vendor["suppliers"][0]) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <tr className="vendors-table__row" key={vendor.id}>
                <td className="vendors-table__cell">{vendor.name}</td>

                <td className="vendors-table__cell">
                  {vendor.suppliers.flatMap((supplier, index, array) => {
                    const elements: React.ReactNode[] = [];

                    const clickable =
                      supplier.primary_contact_name ||
                      supplier.primary_contact_email ||
                      supplier.website ||
                      supplier.phone;

                    if (clickable) {
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
                      elements.push(
                        <span key={supplier.name}>{supplier.name}</span>
                      );
                    }

                    if (index !== array.length - 1) elements.push(", ");
                    return elements;
                  })}
                </td>

                <td className="vendors-table__cell">
                  {vendor.categories.map((category) => category.name).join(", ")}
                </td>
              </tr>
            ))
          ) : isLoading || emptyState ? (
            <tr>
              <td colSpan={3} className="vendors-table__empty-state">
                {isLoading ? "Loading…" : emptyState}
              </td>
            </tr>
          ) : null}
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

            {currentSupplier && shouldShowToolTip(currentSupplier) && (
              <ToolTip
                content={
                  <>
                    <p>
                      <strong className={"tooltip__content--strong"}>
                        Username:
                      </strong>{" "}
                      {currentSupplier.website_username}
                    </p>
                    <p>
                      <strong className={"tooltip__content--strong"}>
                        Password:
                      </strong>{" "}
                      {currentSupplier.website_password}
                    </p>
                  </>
                }
              >
                <a className="vendors-table__modal-credentials-link">
                  Show Website Credentials
                </a>
              </ToolTip>
            )}
            {renderAdditionalContacts(currentSupplier?.additional_contacts)}
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