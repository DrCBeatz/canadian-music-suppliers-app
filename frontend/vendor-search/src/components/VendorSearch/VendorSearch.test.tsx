// VendorSearch.test.tsx

import {
  render,
  screen,
  fireEvent,
  within,
  // waitFor,
} from "@testing-library/react";
import VendorSearch from "./VendorSearch";
import { vi } from "vitest";

describe("VendorSearch", () => {
  
  beforeEach(() => {
    vi.mock("import.meta", () => ({
      env: { VITE_API_BASE_URL: "http://localhost:8000" },
    }));
    vi.clearAllMocks();

    global.fetch = vi.fn((url: RequestInfo | URL, options?: RequestInit) => {
      console.log(`Fetching ${url} with options:`, options);
      const response = new Response(JSON.stringify([]), {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
      });

      return Promise.resolve(response);
    }) as typeof fetch;
  });


  test("renders components correctly on initial load", () => {
    // Mock the onSearch function
    const mockOnSearch = vi.fn();
  
    // Render the component with empty vendors and the mock function
    render(<VendorSearch isUserLoggedIn={false} vendors={[]} onSearch={mockOnSearch} lastSearchTerm="" />);
  
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
  
    render(<VendorSearch isUserLoggedIn={false} vendors={mockData} onSearch={mockOnSearch} lastSearchTerm="" />);
  
    // Simulate a search action
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);
  
    // Expect the VendorsTable to be populated with the mock data
    const displayedVendor = await screen.findByText("Vendor 1");
  
    expect(displayedVendor).toBeInTheDocument();
  });

  // test("handles errors on failed data fetch", async () => {
  //   // Mock the fetch function to simulate a network error
  //   global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
  
  //   // Spy on console.error to verify if the error gets logged as expected
  //   const consoleSpy = vi.spyOn(console, "error");
  
  //   // Mock the searchVendors function to simulate its behavior on error
  //   const mockSearchVendors = vi.fn().mockImplementation(() => {
  //     // Simulate what searchVendors does, including the error handling
  //     throw new Error("Network error");
  //   });
  
  //   // Render the component with the mock searchVendors function
  //   render(<VendorSearch isUserLoggedIn={true} vendors={[]} onSearch={mockSearchVendors} lastSearchTerm="test" />);
  
  //   // Simulate typing into the search input
  //   const searchInput = screen.getByPlaceholderText("Search vendors");
  //   fireEvent.change(searchInput, { target: { value: "test query" } });
  
  //   // Simulate submitting the form
  //   const form = screen.getByRole('form');
  //   fireEvent.submit(form);
  
  //   // Use waitFor to ensure all asynchronous operations inside the component have completed
  //   await waitFor(() => {
  //     // Check if the expected error message is logged to the console
  //     expect(consoleSpy).toHaveBeenCalledWith(
  //       "Error fetching data: ",
  //       expect.objectContaining({ message: "Network error" })
  //     );
  //   });
  
  //   // Cleanup the spy and mocks to restore the original behavior
  //   consoleSpy.mockRestore();
  //   global.fetch.mockRestore();
  // });

  // test("calls searchVendors with the correct term on form submit", async () => {
  //   render(<VendorSearch isUserLoggedIn={false} />);

  //   const searchTerm = "test vendor";
  //   const searchInput = screen.getByRole("searchbox");
  //   fireEvent.change(searchInput, { target: { value: searchTerm } });

  //   const form = searchInput.closest("form");
  //   if (form) {
  //     fireEvent.submit(form);
  //   }

  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith(
  //       expect.stringContaining(`?search=${searchTerm}`),
  //       expect.objectContaining({
  //         credentials: "include",
  //         // Add other expected properties here
  //       })
  //     );
  //   });
  // });

  // test("updates VendorsTable with new data after a successful search", async () => {
  //   const mockData = [
  //     {
  //       id: 1,
  //       name: "Test Vendor",
  //       suppliers: [{ name: "Test Supplier" }],
  //       categories: [{ name: "Test Category" }],
  //     },
  //   ];

  //   (fetch as FetchMock).mockResolvedValueOnce(createFetchResponse(mockData));

  //   render(<VendorSearch isUserLoggedIn={false} />);

  //   const searchTerm = "test vendor";
  //   const searchInput = screen.getByRole("searchbox");
  //   fireEvent.change(searchInput, { target: { value: searchTerm } });

  //   const form = searchInput.closest("form");
  //   if (form) {
  //     fireEvent.submit(form);
  //   }

  //   // Expect the VendorsTable to be populated with the mock data
  //   const displayedVendor = await screen.findByText("Test Vendor");

  //   expect(displayedVendor).toBeInTheDocument();
  //   expect(screen.getByText("Test Supplier")).toBeInTheDocument();
  //   expect(screen.getByText("Test Category")).toBeInTheDocument();
  // });

  // test("searchVendors makes the correct fetch request and sets state on successful fetch", async () => {
  //   const mockData = [
  //     { id: 1, name: "Vendor A", suppliers: [], categories: [] },
  //   ];
  //   (fetch as FetchMock).mockResolvedValueOnce(createFetchResponse(mockData));

  //   render(<VendorSearch isUserLoggedIn={false} />);

  //   const searchInput = screen.getByRole("searchbox");
  //   fireEvent.change(searchInput, { target: { value: "Vendor A" } });
  //   const form = searchInput.closest("form");
  //   if (form) {
  //     fireEvent.submit(form);
  //   }

  //   // Check the fetch request
  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith(
  //       expect.stringContaining("?search=Vendor A"),
  //       expect.objectContaining({
  //         credentials: "include",
  //       })
  //     );
  //   });

  //   // Check that the state has been set based on the mock fetch response
  //   expect(screen.getByText("Vendor A")).toBeInTheDocument();
  // });

  // test("searchVendors logs an error on failed fetch", async () => {
  //   const mockError = "Network error";
  //   (fetch as FetchMock).mockRejectedValueOnce(new Error(mockError));

  //   const consoleSpy = vi.spyOn(console, "error");

  //   render(<VendorSearch isUserLoggedIn={false} />);

  //   const searchInput = screen.getByRole("searchbox");
  //   fireEvent.change(searchInput, { target: { value: "Vendor A" } });
  //   const form = searchInput.closest("form");
  //   if (form) {
  //     fireEvent.submit(form);
  //   }

  //   // Check that the error was logged
  //   await waitFor(() => {
  //     expect(consoleSpy).toHaveBeenCalledWith(
  //       "Error fetching data: ",
  //       expect.objectContaining({ message: mockError })
  //     );
  //   });

  //   consoleSpy.mockRestore();
  // });

  // test("searchVendors logs an error on invalid fetch response status", async () => {
  //   (fetch as FetchMock).mockResolvedValueOnce({
  //     ok: false,
  //     status: 404,
  //     json: () => Promise.resolve({ message: "Not Found" }),
  //   });

  //   const consoleSpy = vi.spyOn(console, "error");

  //   render(<VendorSearch isUserLoggedIn={false} />);

  //   const searchInput = screen.getByRole("searchbox");
  //   fireEvent.change(searchInput, { target: { value: "Vendor A" } });
  //   const form = searchInput.closest("form");
  //   if (form) {
  //     fireEvent.submit(form);
  //   }

  //   // Check that the error was logged
  //   await waitFor(() => {
  //     expect(consoleSpy).toHaveBeenCalledWith(
  //       "Error fetching data: ",
  //       expect.objectContaining({ message: "HTTP error! Status: 404" })
  //     );
  //   });

  //   consoleSpy.mockRestore();
  // });

  // const mockApiUrl = "http://mocked-api-url.com";

  // test("uses provided API URL when passed as a prop", async () => {
  //   // Mock fetch to track calls
  //   global.fetch = vi.fn().mockImplementation((url) => {
  //     return Promise.resolve({
  //       ok: true,
  //       json: () => Promise.resolve([]),
  //       url, // Track the URL used in the fetch call
  //     });
  //   });

  //   // Render the component with a mocked API URL
  //   render(<VendorSearch apiUrl={mockApiUrl} isUserLoggedIn={false} />);

  //   // Simulate a search action to trigger the fetch call
  //   const searchInput = screen.getByRole("searchbox");
  //   fireEvent.change(searchInput, { target: { value: "test" } });
  //   const form = searchInput.closest("form");
  //   if (form) {
  //     fireEvent.submit(form);
  //   }

  //   // Wait for fetch to be called and then verify the URL
  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith(
  //       expect.stringContaining(mockApiUrl),
  //       expect.objectContaining({
  //         credentials: "include",
  //       })
  //     );
  //   });
  // });
});
