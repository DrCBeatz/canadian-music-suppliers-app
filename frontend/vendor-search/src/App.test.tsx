import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { describe, test, vi } from "vitest";
import Modal from "react-modal";

type FetchResponseData = {
  detail: string;
  username?: string;
};

vi.mock("react-modal", async () => {
  const actual: { default: typeof Modal } = await vi.importActual(
    "react-modal"
  );
  return {
    __esModule: true,
    default: actual.default,
    setAppElement: () => {},
  };
});

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockFetch = (ok: boolean, data: FetchResponseData) =>
    vi.fn(
      () =>
        Promise.resolve({
          ok,
          json: () => Promise.resolve(data),
        }) as Promise<Response>
    );
  test("displays username in navbar after successful login", async () => {
    vi.spyOn(global, "fetch").mockImplementationOnce(
      mockFetch(true, { detail: "Login successful", username: "testuser" })
    );

    render(<App />);

    // Log the rendered output before interacting
    screen.debug();

    // Open login modal
    fireEvent.click(screen.getByTestId("navbar-login-button"));

    // Wait for modal to open and render its contents
    await waitFor(() => screen.getByPlaceholderText("Username"));

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Log the rendered output before submitting the form
    screen.debug();

    // Submit login form
    fireEvent.click(screen.getByTestId("modal-login-button"));

    // Wait for the username to appear
    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    // Log the rendered output after the expected change
    screen.debug();
  });

  test("removes username from navbar after logout", async () => {
    vi.spyOn(global, "fetch")
      .mockImplementationOnce(
        mockFetch(true, { detail: "Login successful", username: "testuser" })
      )
      .mockImplementationOnce(mockFetch(true, { detail: "Logout successful" }));

    render(<App />);

    // Simulate login
    fireEvent.click(screen.getByTestId("navbar-login-button"));
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("modal-login-button"));

    // Wait for the username to appear
    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    // Simulate logout
    fireEvent.click(screen.getByRole("button", { name: "Logout" })); // Specifically target the logout button

    // Wait for the username to disappear
    await waitFor(() => {
      expect(screen.queryByText("testuser")).not.toBeInTheDocument();
    });
  });
});
