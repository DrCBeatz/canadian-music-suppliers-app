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
  status?: number;
  json: () => Promise<unknown>;
};

type FetchMockType = typeof fetch & {
  mockImplementation: (mock: () => Promise<FetchResponse>) => void;
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

    // Set up a default fetch mock
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }) as FetchMockType;
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

  /**
   * This test verifies that the VendorSearch component handles network errors gracefully.
   * When the fetch request to retrieve vendors fails, the error should be logged to the console.
   *
   * Note: The 'Network error' that appears in test logs is expected and is intentionally triggered by this test.
   */
  test("handles errors on failed data fetch", async () => {
    // Intentionally mock a failed fetch request to simulate a network error
    const mockError = "Network error";
    (fetch as FetchMock).mockRejectedValueOnce(new Error(mockError));

    // Spy on console.error to verify if the error gets logged as expected
    const consoleSpy = vi.spyOn(console, "error");

    render(<VendorSearch />);

    // Simulate a search action, which should trigger the fetch request
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Use waitFor to ensure all asynchronous operations inside the component have completed
    await waitFor(() => {
      // Check if the expected error message is logged to the console
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching data: ",
        expect.objectContaining({ message: mockError })
      );
    });

    // Cleanup the spy to restore the original console.error behavior
    consoleSpy.mockRestore();
  });

  test("calls searchVendors with the correct term on form submit", async () => {
    render(<VendorSearch />);

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

  test("searchVendors makes the correct fetch request and sets state on successful fetch", async () => {
    const mockData = [
      { id: 1, name: "Vendor A", suppliers: [], categories: [] },
    ];
    (fetch as FetchMock).mockResolvedValueOnce(createFetchResponse(mockData));

    render(<VendorSearch />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Vendor A" } });
    const form = searchInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Check the fetch request
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("?search=Vendor A")
      );
    });

    test("searchVendors logs an error on failed fetch", async () => {
      const mockError = "Network error";
      (fetch as FetchMock).mockRejectedValueOnce(new Error(mockError));

      const consoleSpy = vi.spyOn(console, "error");

      render(<VendorSearch />);

      const searchInput = screen.getByRole("searchbox");
      fireEvent.change(searchInput, { target: { value: "Vendor A" } });
      const form = searchInput.closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      // Check that the error was logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching data: ",
          expect.objectContaining({ message: mockError })
        );
      });

      consoleSpy.mockRestore();
    });

    // Check that the state has been set based on the mock fetch response
    expect(screen.getByText("Vendor A")).toBeInTheDocument();
  });
});

describe("API URL based on environment", () => {
  afterEach(() => {
    // Restore all environment variables after each test.
    vi.unstubAllEnvs();
  });

  test("uses development API URL in development mode", async () => {
    vi.stubEnv("NODE_ENV", "development");

    // Render the component AFTER setting the environment variable.
    render(<VendorSearch />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "test" } });
    const form = searchInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("http://localhost:8000/routes/vendors/")
      );
    });
  });

  test("uses production API URL in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");

    // Render the component AFTER setting the environment variable.
    render(<VendorSearch />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "test" } });
    const form = searchInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://secure-falls-59693-7d816c7f067e.herokuapp.com/routes/vendors/"
        )
      );
    });
  });

  test("searchVendors logs an error on invalid fetch response status", async () => {
    (fetch as FetchMock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: "Not Found" }),
    });

    const consoleSpy = vi.spyOn(console, "error");

    render(<VendorSearch />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Vendor A" } });
    const form = searchInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Check that the error was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching data: ",
        expect.objectContaining({ message: "HTTP error! Status: 404" })
      );
    });

    consoleSpy.mockRestore();
  });
});
