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

test("pagination: shows Next and fetches page 2 when Next is clicked", async () => {
  const user = userEvent.setup();

  // CSRF on mount
  const csrfResp = {
    ok: true,
    status: 200,
    json: async () => ({ csrfToken: "fake-token" }),
  } as Response;

  // Page 1 response
  const page1Resp = {
    ok: true,
    status: 200,
    json: async () => ({
      count: 60,
      next: "http://testserver/routes/vendors/?page=2&page_size=25&search=abc",
      previous: null,
      results: [
        { id: 1, name: "Vendor 1", suppliers: [], categories: [] },
      ],
    }),
  } as Response;

  // Page 2 response
  const page2Resp = {
    ok: true,
    status: 200,
    json: async () => ({
      count: 60,
      next: "http://testserver/routes/vendors/?page=3&page_size=25&search=abc",
      previous: "http://testserver/routes/vendors/?page=1&page_size=25&search=abc",
      results: [
        { id: 2, name: "Vendor 2", suppliers: [], categories: [] },
      ],
    }),
  } as Response;

  global.fetch = vi
    .fn()
    .mockResolvedValueOnce(csrfResp)
    .mockResolvedValueOnce(page1Resp)
    .mockResolvedValueOnce(page2Resp) as unknown as typeof fetch;

  render(<App />);

  await user.type(screen.getByPlaceholderText(/search vendors/i), "abc");
  await user.click(screen.getByRole("button", { name: /search/i }));

  expect(await screen.findByText("Vendor 1")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Next" }));

  expect(await screen.findByText("Vendor 2")).toBeInTheDocument();
});