import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'

interface SidebarWrapperProps {
  children: ReactNode
}

function SidebarWrapper({ children }: SidebarWrapperProps) {
  return <SidebarProvider>{children}</SidebarProvider>
}

export function renderWithSidebar(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: SidebarWrapper, ...options })
}

export * from '@testing-library/react'
