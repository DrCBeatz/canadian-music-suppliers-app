// Navbar.test.tsx

import { render, fireEvent, screen } from "@testing-library/react";
import Navbar from "./Navbar";

describe("Navbar", () => {
  test("renders Navbar component", () => {
    render(<Navbar />);
    expect(
      screen.getByText("Canada Music Suppliers & Vendors")
    ).toBeInTheDocument();
  });

  test("contains login button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("login button click works", () => {
    const mockClickHandler = vi.fn();
    render(<Navbar onLoginClick={mockClickHandler} />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);
    expect(mockClickHandler).toHaveBeenCalled();
  });
});
