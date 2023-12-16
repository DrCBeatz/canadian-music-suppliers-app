// VendorsTable.test.tsx
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Modal from "react-modal";
import VendorsTable, { Vendor } from "./VendorsTable";

const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "Vendor A",
    suppliers: [
      {
        name: "Supplier A1",
        primary_contact_name: "John Doe",
        primary_contact_email: "john@example.com",
        website: "http://example.com",
        phone: "123-456-7890",
        minimum_order_amount: "100",
        notes: "Special instructions here",
        shipping_fees: "5",
        max_delivery_time: "48h",
        accounting_email: "accounting@example.com",
        accounting_contact: "Jane Doe",
        account_number: "1234567890",
        account_active: true,
      },
      { name: "Supplier A2" },
    ],
    categories: [{ name: "Category A1" }, { name: "Category A2" }],
  },
];

describe("VendorsTable", () => {
  // Mock the setAppElement for react-modal
  beforeAll(() => {
    Modal.setAppElement(document.createElement("div"));
  });

  beforeEach(() => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={false} />);
  });

  test("renders vendors, suppliers, and categories", () => {
    expect(screen.getByText("Vendor A")).toBeInTheDocument();
    expect(screen.getByText("Supplier A1")).toBeInTheDocument();
    expect(screen.getByText(/Supplier A2/)).toBeInTheDocument(); // use regex for this, as it could be part of a larger text node.
    expect(screen.getByText("Category A1, Category A2")).toBeInTheDocument();
  });
  test("opens modal with supplier details on supplier click", () => {
    fireEvent.click(screen.getByText("Supplier A1"));

    const dialog = screen.getByRole("dialog");
    const h2Element = dialog.querySelector("h2");
    expect(h2Element?.textContent).toBe("Supplier A1");

    expect(screen.getByText("John Doe")).toBeInTheDocument();

    expect(screen.getByText("john@example.com")).toBeInTheDocument();

    expect(screen.getByText("123-456-7890")).toBeInTheDocument();
  });

  test("closes modal on close button click", async () => {
    fireEvent.click(screen.getByText("Supplier A1")); // Open the modal
    fireEvent.click(screen.getByText("Close")); // Close the modal

    // Use waitFor to wait for the modal to be removed from the DOM.
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Supplier A1")).toBeInTheDocument(); // Supplier A1 is still present in the table
  });
});

describe("VendorsTable with isUserLoggedIn true", () => {
  beforeEach(() => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={true} />);
  });

  test("renders additional fields when isUserLoggedIn is true", async () => {
    fireEvent.click(screen.getByText("Supplier A1")); // Trigger modal

    // Verify that the additional fields are rendered
    await waitFor(() => {
      expect(screen.getByText(/Minimum Order Amount:/)).toBeInTheDocument();
      expect(screen.getByText(/Notes:/)).toBeInTheDocument();
      expect(screen.getByText(/Shipping Fees:/)).toBeInTheDocument();
      expect(screen.getByText(/Max Delivery Time:/)).toBeInTheDocument();
      expect(screen.getByText(/Accounting Email:/)).toBeInTheDocument();
      expect(screen.getByText(/Accounting Contact:/)).toBeInTheDocument();
      expect(screen.getByText(/Accounting Number:/)).toBeInTheDocument();
      expect(screen.getByText(/Account Active:/)).toBeInTheDocument();
    });
  });
});

describe("VendorsTable with isUserLoggedIn false", () => {
  beforeEach(() => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={false} />);
  });

  test("does not render additional fields when isUserLoggedIn is false", async () => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={false} />);

    // Use getAllByText to retrieve all elements, then select the one you want to interact with
    const supplierElements = screen.getAllByText("Supplier A1");
    fireEvent.click(supplierElements[0]); // Adjust the index if needed to target the correct element

    await waitFor(() => {
      expect(
        screen.queryByText(/Minimum Order Amount:/)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Notes:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Shipping Fees:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Max Delivery Time:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Accounting Email:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Accounting Contact:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Accounting Number:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Account Active:/)).not.toBeInTheDocument();
    });
  });
});
