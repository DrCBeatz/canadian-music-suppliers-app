// App.test.tsx
import { render, act } from "@testing-library/react";
import App from "./App";

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