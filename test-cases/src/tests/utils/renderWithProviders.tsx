import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Custom render function for AnalyticsDashboard components (no providers needed currently)
export function renderAnalyticsDashboard(
  ui: ReactElement,
  options: RenderOptions = {}
) {
  return render(ui, {
    ...options
  })
}

// Custom render function with routing context for integration tests
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  )
}

// Custom render function with full providers (for future expansion)
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  }: { initialEntries?: string[] } & RenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing-library for convenience
export * from '@testing-library/react'