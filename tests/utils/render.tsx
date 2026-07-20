import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ComparisonProvider } from '../../src/context/ComparisonContext'

type ProvidersProps = {
  children: ReactNode
  route?: string
}

function Providers({ children, route = '/' }: ProvidersProps): ReactElement {
  return (
    <MemoryRouter initialEntries={[route]}>
      <ComparisonProvider>{children}</ComparisonProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string },
) {
  const { route, ...rest } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => <Providers route={route}>{children}</Providers>,
    ...rest,
  })
}
