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

type FetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

type FetchMock = typeof fetch & {
  mockResolvedValueOnce: (response: FetchResponse) => void;
  mockRejectedValueOnce: (error: Error) => void;
};
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

  test("populates VendorsTable on successful data fetch", async () => {
    // Mock a successful fetch request
    // Using 'any' here for mocking purposes during testing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.fetch = vi.fn() as any;

    // Using 'any' here for mocking purposes during testing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function createFetchResponse(data: any) {
      return {
        ok: true,
        json: () => new Promise((resolve) => resolve(data)),
      };
    }

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

  // ... other tests will go here
});
