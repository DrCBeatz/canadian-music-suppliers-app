import { render, screen, within } from "@testing-library/react";
import VendorSearch from "./VendorSearch";

describe("VendorSearch", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test("renders components correctly on initial load", () => {
    render(<VendorSearch />);

    // Expectations for initial render:
    expect(screen.getByRole("banner")).toBeInTheDocument(); // This assumes AppHeader renders a <header> element (banner role)
    expect(screen.getByRole("searchbox")).toBeInTheDocument(); // This assumes SearchForm renders an input of type "search"
    expect(screen.getByRole("table")).toBeInTheDocument(); // This assumes VendorsTable renders a <table> element

    // Ensure the table is initially empty:
    const table = screen.getByRole("table");
    const rowgroups = within(table).getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // This will select <tbody>

    expect(tbody).not.toHaveTextContent(/Vendor/);

    expect(within(tbody).queryByText(/Supplier/)).not.toBeInTheDocument();

    expect(screen.queryByText(/Category/)).not.toBeInTheDocument();
  });

  // ... other tests will go here
});
