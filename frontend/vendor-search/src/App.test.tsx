// App.test.tsx
import { render, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "./App";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

global.fetch = vi.fn(
  () =>
    Promise.resolve({
      json: () => Promise.resolve({ csrfToken: "fake-token" }),
      ok: true,
      status: 200,
      headers: new Headers(),
      redirected: false,
      statusText: "OK",
      type: "default",
      url: "",
      body: null,
      bodyUsed: false,
      clone: function () {
        return this;
      }, // These functions don't need real implementations for the test.
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => "",
    } as Response) // Typecasting as Response to satisfy TypeScript.
);

test("fetches CSRF token on mount", async () => {
  await act(async () => {
    render(<App />);
  });
  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/get-csrf/",
    expect.anything()
  );
});

test("shows Loading… during search and then shows no-results when response is empty", async () => {
  const user = userEvent.setup();

  const vendorFetch = deferred<Response>();

  // 1st fetch: CSRF token on mount
  // 2nd fetch: vendors search (we keep it pending)
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ csrfToken: "fake-token" }),
    } as Response)
    .mockReturnValueOnce(vendorFetch.promise) as unknown as typeof fetch;

  render(<App />);

  // Trigger search
  await user.type(screen.getByPlaceholderText(/search vendors/i), "zzz");
  await user.click(screen.getByRole("button", { name: /search/i }));

  // While the request is pending, loading should show
  expect(await screen.findByText(/Loading/)).toBeInTheDocument();

  // Resolve the vendors request with empty results
  vendorFetch.resolve({
    ok: true,
    status: 200,
    json: async () => [],
  } as Response);

  // Now it should show the empty state message
  expect(await screen.findByText(/No results for/i)).toBeInTheDocument();
  expect(screen.getByText(/"zzz"/i)).toBeInTheDocument();
});