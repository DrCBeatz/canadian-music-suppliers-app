import { render, fireEvent, screen } from "@testing-library/react";
import SearchForm from "./SearchForm";

const mockFn = vi.fn(); // replace `jest.fn()` with vitest's `vi.fn()`

describe("SearchForm", () => {
  test("renders without crashing", () => {
    render(<SearchForm onSearch={mockFn} />);
    expect(screen.getByPlaceholderText("Search vendors")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  test("typing into the input updates its value", () => {
    render(<SearchForm onSearch={mockFn} />);
    const input = screen.getByPlaceholderText("Search vendors") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test Vendor" } });
    expect(input.value).toBe("Test Vendor");
  });

  test("submitting the form calls the onSearch prop with input value", () => {
    const onSearchMock = mockFn;
    render(<SearchForm onSearch={onSearchMock} />);
    const input = screen.getByPlaceholderText("Search vendors") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test Vendor" } });
    fireEvent.click(screen.getByText("Search"));
    expect(onSearchMock).toHaveBeenCalledWith("Test Vendor");
  });
});
