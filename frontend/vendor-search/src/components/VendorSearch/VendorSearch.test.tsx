// VendorSearch.test.tsx
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import VendorSearch from "./VendorSearch";
import { vi } from "vitest";
import { Vendor } from "../VendorsTable/VendorsTable";

type FetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

type FetchMock = typeof fetch & {
  mockResolvedValueOnce: (response: FetchResponse) => void;
  mockRejectedValueOnce: (error: Error) => void;
};
describe("VendorSearch", () => {
  const createFetchResponse = (data: Vendor[]): FetchResponse => {
    return {
      ok: true,
      json: () => new Promise((resolve) => resolve(data)),
    };
  };
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

  test("populates VendorsTable on successful data fetch", async () => {
    // Mock a successful fetch request
    // Using 'any' here for mocking purposes during testing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.fetch = vi.fn() as any;

    console.log("Setting up mock data...");

    const mockData = [
      {
        id: 1,
        name: "Vendor 1",
        suppliers: [{ name: "Supplier A" }],
        categories: [{ name: "Category X" }],
      },
      // ... more mock data entries as needed
    ];

    (fetch as FetchMock).mockResolvedValueOnce(createFetchResponse(mockData));

    console.log("Mock data setup complete.");

    render(<VendorSearch />);

    console.log("VendorSearch component rendered.");

    // Simulate a search action
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    console.log("Search button clicked.");

    // Expect the VendorsTable to be populated with the mock data
    const displayedVendor = await screen.findByText("Vendor 1");

    expect(displayedVendor).toBeInTheDocument();

    // ... Check for other mock data entries as needed
  });

  test("handles errors on failed data fetch", async () => {
    // Mock a failed fetch request
    const mockError = "Network error";
    (fetch as FetchMock).mockRejectedValueOnce(new Error(mockError));

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, "error");

    render(<VendorSearch />);

    // Simulate a search action
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Use waitFor to ensure the asynchronous operations inside the component complete
    await waitFor(() => {
      // Expect the error to be logged in the console
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching data: ",
        expect.objectContaining({ message: mockError })
      );
    });

    // Cleanup the spy
    consoleSpy.mockRestore();
  });

  test("calls searchVendors with the correct term on form submit", async () => {
    render(<VendorSearch />);

    // Mocking the fetch request so the actual network request doesn't go out
    global.fetch = vi.fn() as unknown as FetchMock;

    const searchTerm = "test vendor";
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    const form = searchInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`?search=${searchTerm}`)
      );
    });
  });

  test("updates VendorsTable with new data after a successful search", async () => {
    // Mock a successful fetch request
    global.fetch = vi.fn() as unknown as FetchMock;

    const mockData = [
      {
        id: 1,
        name: "Test Vendor",
        suppliers: [{ name: "Test Supplier" }],
        categories: [{ name: "Test Category" }],
      },
    ];

    (fetch as FetchMock).mockResolvedValueOnce(createFetchResponse(mockData));

    render(<VendorSearch />);

    const searchTerm = "test vendor";
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    const form = searchInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Expect the VendorsTable to be populated with the mock data
    const displayedVendor = await screen.findByText("Test Vendor");

    expect(displayedVendor).toBeInTheDocument();
    expect(screen.getByText("Test Supplier")).toBeInTheDocument();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });
  // ... other tests will go here
});

// Search Vendors:

// You could write tests to ensure that the correct API URL is used based on the environment (development or production). This might be a bit trickier because it involves environment variables, but it's possible with Jest by using jest.doMock() or other similar methods.
// Async Function Behavior:

// Test the async function searchVendors to ensure it makes the correct fetch request and sets the state appropriately.
