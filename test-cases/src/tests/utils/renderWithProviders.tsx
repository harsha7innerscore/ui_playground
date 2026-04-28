import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactElement } from "react";

interface RenderWithRouterOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  initialEntries?: string[];
}

/**
 * Custom render function that wraps components with necessary providers
 * for testing (Router, etc.)
 */
export function renderWithRouter(
  ui: ReactElement,
  {
    route = "/",
    initialEntries = [route],
    ...renderOptions
  }: RenderWithRouterOptions = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
    renderOptions,
  );
}

/**
 * Re-export everything from React Testing Library
 */
export * from "@testing-library/react";
export { renderWithRouter as render };
