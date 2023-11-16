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
    render(<VendorsTable vendors={mockVendors} />);
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
