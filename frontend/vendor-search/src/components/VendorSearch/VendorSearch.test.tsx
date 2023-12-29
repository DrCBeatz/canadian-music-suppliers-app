// VendorSearch.test.tsx

import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import VendorSearch from "./VendorSearch";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Modal from "react-modal";

Modal.setAppElement(document.createElement("div"));

type MockData = {
  id: number;
  name: string;
  suppliers: { name: string }[];
  categories: { name: string }[];
};

function createMockResponse<T = MockData>(data: T): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("VendorSearch", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch; // Save the original fetch
    // Use createMockResponse function in your mock
    global.fetch = vi.fn(() =>
      Promise.resolve(createMockResponse([]))
    ) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch; // Restore original fetch after each test
    afterEach(() => {
      vi.clearAllMocks(); // Clear all mocks after each test
    });
  });

  test("renders components correctly on initial load", () => {
    // Mock the onSearch function
    const mockOnSearch = vi.fn();

    // Mock functions for errorMessage props
    const mockClearErrorMessage = vi.fn();
    const errorMessage = "";

    // Render the component with empty vendors and the mock function
    render(
      <VendorSearch
        isUserLoggedIn={false}
        vendors={[]}
        onSearch={mockOnSearch}
        lastSearchTerm=""
        errorMessage={errorMessage}
        clearErrorMessage={mockClearErrorMessage}
      />
    );

    // Expectations for initial render:
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Ensure the table is initially empty:
    const table = screen.getByRole("table");
    const rowgroups = within(table).getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // This will select <tbody>

    expect(tbody).not.toHaveTextContent(/Vendor/);
  });

  test("populates VendorsTable on successful data fetch", async () => {
    const mockData = [
      {
        id: 1,
        name: "Vendor 1",
        suppliers: [{ name: "Supplier A" }],
        categories: [{ name: "Category X" }],
      },
    ];

    // Mock the onSearch function to resolve with mockData
    const mockOnSearch = vi.fn().mockResolvedValue(mockData);

    // Mock functions for errorMessage props
    const mockClearErrorMessage = vi.fn();
    const errorMessage = "";

    render(
      <VendorSearch
        isUserLoggedIn={false}
        vendors={mockData}
        onSearch={mockOnSearch}
        lastSearchTerm=""
        errorMessage={errorMessage}
        clearErrorMessage={mockClearErrorMessage}
      />
    );

    // Simulate a search action
    const searchButton = screen.getByRole("button", { name: /search/i });
    await act(async () => {
      fireEvent.click(searchButton);
    });
    // Expect the VendorsTable to be populated with the mock data
    const displayedVendor = await screen.findByText("Vendor 1");

    expect(displayedVendor).toBeInTheDocument();
  });

  test("calls searchVendors with the correct term on form submit", async () => {
    // Mock the searchVendors function
    const mockSearchVendors = vi.fn();

    // Mock functions for errorMessage props
    const mockClearErrorMessage = vi.fn();
    const errorMessage = "";

    // Render the VendorSearch component with the mock and necessary props
    render(
      <VendorSearch
        isUserLoggedIn={true}
        vendors={[]}
        onSearch={mockSearchVendors}
        lastSearchTerm=""
        clearErrorMessage={mockClearErrorMessage}
        errorMessage={errorMessage}
      />
    );

    // Define the search term
    const searchTerm = "test vendor";

    // Simulate typing into the search input
    const searchInput = screen.getByPlaceholderText("Search vendors");
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    // Simulate submitting the form
    const form = screen.getByTestId("search-form");
    fireEvent.submit(form);

    // Wait for the mock function to be called and assert it was called with the correct term
    await waitFor(() => {
      expect(mockSearchVendors).toHaveBeenCalledWith(searchTerm);
    });
  });

  test("updates VendorsTable with new data after a successful search", async () => {
    const mockData = [
      {
        id: 1,
        name: "Vendor 1",
        suppliers: [{ name: "Supplier A" }],
        categories: [{ name: "Category X" }],
      },
    ];
    // Mock the onSearch function to resolve with mockData
    const mockOnSearch = vi.fn().mockResolvedValue(mockData);

    // Mock functions for errorMessage props
    const mockClearErrorMessage = vi.fn();
    const errorMessage = "";

    // Replace the fetch mock for this specific test
    global.fetch = vi.fn(() =>
      Promise.resolve(createMockResponse(mockData))
    ) as typeof fetch;
    render(
      <VendorSearch
        isUserLoggedIn={true}
        vendors={mockData}
        onSearch={mockOnSearch}
        lastSearchTerm=""
        clearErrorMessage={mockClearErrorMessage}
        errorMessage={errorMessage}
      />
    );

    // Simulate user typing in the search box
    const searchInput = screen.getByRole("searchbox");
    userEvent.type(searchInput, "New Vendor");

    // Simulate user clicking the search button
    const searchButton = screen.getByRole("button", { name: /search/i });
    userEvent.click(searchButton);

    // Assert that the table eventually contains the new data
    for (const vendor of mockData) {
      await waitFor(() => {
        expect(screen.getByText(vendor.name)).toBeInTheDocument();
      });
    }
  });
});
