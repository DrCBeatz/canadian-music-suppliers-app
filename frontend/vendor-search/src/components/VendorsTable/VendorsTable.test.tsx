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
  {
    id: 2,
    name: "Vendor B",
    suppliers: [
      {
        name: "Supplier B1",
        primary_contact_name: "Jane Doe",
        primary_contact_email: "jane@example.com",
        website: "http://example.com",
        phone: "123-456-7890",
        minimum_order_amount: "100",
        notes: "Special instructions here",
        shipping_fees: "5",
        max_delivery_time: "48h",
        accounting_email: "accounting@example.com",
        accounting_contact: "Jim Doe",
        account_number: "1234567890",
        account_active: true,
        additional_contacts: [
          {
            id: 1,
            name: "Contact B1",
            email: "contactb1@example.com",
            role: "Role B1",
          },
        ],
      },
      {
        name: "Supplier B2",
        primary_contact_name: "Jane Doe",
        primary_contact_email: "jane@example.com",
        website: "http://example.com",
        phone: "123-456-7890",
        minimum_order_amount: "100",
        notes: "Special instructions here",
        shipping_fees: "5",
        max_delivery_time: "48h",
        accounting_email: "accounting@example.com",
        accounting_contact: "Jim Doe",
        account_number: "1234567890",
        account_active: true,
        additional_contacts: [], // No additional contacts
      },
    ],
    categories: [{ name: "Category B1" }],
  },
  {
    id: 3,
    name: "Vendor C",
    suppliers: [
      {
        name: "Supplier With Credentials",
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
        website_username: "user123",
        website_password: "pass123",
      },
      {
        name: "Supplier Without Credentials",
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
        website_username: "",
        website_password: "",
      },
    ],
    categories: [{ name: "Category C1" }, { name: "Category C2" }],
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

describe("VendorsTable with additional contacts", () => {
  beforeEach(() => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={true} />);
  });

  test("renders additional contacts when present", async () => {
    fireEvent.click(screen.getByText("Supplier B1")); // Open the modal for a supplier with additional contacts

    await waitFor(() => {
      expect(screen.getByText(/Contact B1/)).toBeInTheDocument();
      expect(screen.getByText(/contactb1@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/Role B1/)).toBeInTheDocument();
    });
  });

  test("does not render additional contacts section when absent", async () => {
    fireEvent.click(screen.getByText("Supplier B2")); // Open the modal for a supplier without additional contacts

    await waitFor(() => {
      // Ensure the additional contacts section is not rendered
      expect(
        screen.queryByText("Additional Contacts:")
      ).not.toBeInTheDocument();
    });
  });
});

describe("VendorsTable with Tooltip Visibility", () => {
  test("renders ToolTip when credentials are present and user is logged in", async () => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={true} />);

    // Click on the supplier with credentials to open the modal
    fireEvent.click(screen.getByText("Supplier With Credentials"));

    await waitFor(() => {
      // Check for a specific part of the ToolTip content
      expect(screen.getByText(/Username:/)).toBeInTheDocument();
      expect(screen.getByText(/Password:/)).toBeInTheDocument();
    });
  });

  test("does not render ToolTip when credentials are absent", async () => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={true} />);

    // Click on the supplier without credentials to open the modal
    fireEvent.click(screen.getByText("Supplier Without Credentials"));

    await waitFor(() => {
      // Ensure the ToolTip content is not rendered
      expect(screen.queryByText(/Username:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Password:/)).not.toBeInTheDocument();
    });
  });

  test("does not render ToolTip when user is not logged in", async () => {
    render(<VendorsTable vendors={mockVendors} isUserLoggedIn={false} />);

    // Click on the supplier with credentials to open the modal
    fireEvent.click(screen.getByText("Supplier With Credentials"));

    await waitFor(() => {
      // Ensure the ToolTip content is not rendered
      expect(screen.queryByText(/Username:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Password:/)).not.toBeInTheDocument();
    });
  });
});

describe("VendorsTable loading & empty state rendering", () => {
  beforeAll(() => {
    Modal.setAppElement(document.createElement("div"));
  });

  test("shows Loading… row when isLoading=true and vendors is empty", () => {
    render(
      <VendorsTable vendors={[]} isUserLoggedIn={false} isLoading={true} />
    );

    // Use /Loading/ so you don't have to match the exact ellipsis character
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  test("shows emptyState when provided and vendors is empty (not loading)", () => {
    render(
      <VendorsTable
        vendors={[]}
        isUserLoggedIn={false}
        isLoading={false}
        emptyState={
          <>
            No results for <span>"fender"</span>.
          </>
        }
      />
    );

    expect(screen.getByText(/No results for/i)).toBeInTheDocument();
    expect(screen.getByText(/"fender"/i)).toBeInTheDocument();
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  test("does not show loading/empty state row if vendors exist", () => {
    render(
      <VendorsTable vendors={mockVendors} isUserLoggedIn={false} isLoading={true} />
    );

    // The table should show vendor rows, not the empty state row.
    expect(screen.getByText("Vendor A")).toBeInTheDocument();
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    expect(screen.queryByText(/No results for/i)).not.toBeInTheDocument();
  });
});