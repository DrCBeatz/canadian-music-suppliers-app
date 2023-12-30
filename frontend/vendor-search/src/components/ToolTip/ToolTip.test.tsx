// ToolTip.test.tsx

// import React from 'react';
import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ToolTip from "./ToolTip";

describe("ToolTip Component", () => {
  test("renders ToolTip children", () => {
    render(<ToolTip content="Tooltip content">Hover over me</ToolTip>);
    expect(screen.getByText("Hover over me")).toBeInTheDocument();
  });

  test("shows content on mouse enter and hides on mouse leave", async () => {
    render(<ToolTip content="Tooltip content">Hover over me</ToolTip>);
    const triggerElement = screen.getByText("Hover over me");

    // Initially, tooltip content should not be visible
    expect(screen.queryByText("Tooltip content")).not.toBeVisible();

    // Simulate mouse entering the tooltip trigger
    fireEvent.mouseEnter(triggerElement);
    expect(screen.getByText("Tooltip content")).toBeVisible();

    // Simulate mouse leaving the tooltip trigger
    fireEvent.mouseLeave(triggerElement);
    // You might need to wait for the next "tick" to allow state updates
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByText("Tooltip content")).not.toBeVisible();
  });
});
