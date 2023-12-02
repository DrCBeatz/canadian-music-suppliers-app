import { render, screen, fireEvent, act } from "@testing-library/react";
import Modal from "react-modal";
import LoginModal from "./LoginModal";

beforeAll(() => {
  Modal.setAppElement(document.createElement("div"));
});

describe("LoginModal", () => {
  test("renders LoginModal component", () => {
    render(
      <LoginModal
        isOpen={true}
        onRequestClose={() => {}}
        onLoginSuccess={() => {}}
      />
    );
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument(); // Adjusted line
  });
  test("allows entering a username and password", () => {
    render(
      <LoginModal
        isOpen={true}
        onRequestClose={() => {}}
        onLoginSuccess={() => {}}
      />
    );

    const usernameInput = screen.getByPlaceholderText(
      "Username"
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Password"
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  test("submits the form with username and password", async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ detail: "Login successful" }),
        })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    const onLoginSuccess = vi.fn();
    render(
      <LoginModal
        isOpen={true}
        onRequestClose={() => {}}
        onLoginSuccess={onLoginSuccess}
      />
    );

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Use act to wrap async operations
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await vi.runAllTimers();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "password123" }),
      })
    );
    expect(onLoginSuccess).toHaveBeenCalled();

    vi.restoreAllMocks(); // Clean up mocks after the test
  });

  test("calls onRequestClose when close button is clicked", () => {
    const onRequestClose = vi.fn();
    render(
      <LoginModal
        isOpen={true}
        onRequestClose={onRequestClose}
        onLoginSuccess={() => {}}
      />
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    expect(onRequestClose).toHaveBeenCalled();
  });

//   Implement the following test when failed login error messaages are implemented
  test('shows error message on failed login', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ detail: 'Invalid credentials' }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
  
    render(<LoginModal isOpen={true} onRequestClose={() => {}} onLoginSuccess={() => {}} />);
  
    // Simulate user input, form submission, and assert error message...
  });
  
});
