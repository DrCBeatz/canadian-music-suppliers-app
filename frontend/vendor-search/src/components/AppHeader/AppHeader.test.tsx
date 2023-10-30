// AppHeader.test.tsx
import { test } from "vitest";
import { render } from "@testing-library/react";
import AppHeader from "./AppHeader";

test("renders the header title", () => {
  const { getByText } = render(<AppHeader />);
  const titleElement = getByText(/Canada Music Suppliers & Vendors/i);
  expect(titleElement).toBeInTheDocument();
});

// 1. Check if the component renders without crashing.
test("AppHeader renders without crashing", () => {
  render(<AppHeader />);
});

// 2. Check if the header divider exists in the rendered component.
test("renders the header divider", () => {
  const { getByRole } = render(<AppHeader />);
  const dividerElement = getByRole("separator"); // <hr> has a default role of "separator"
  expect(dividerElement).toBeInTheDocument();
});