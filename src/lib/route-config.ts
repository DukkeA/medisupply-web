// Configuración de rutas para el breadcrumb dinámico
export interface RouteConfig {
  label: string
  showInBreadcrumb?: boolean
  icon?: string
}

export const routeLabels: Record<string, RouteConfig> = {
  // Root
  '/': { label: 'Home', showInBreadcrumb: false },

  // Products
  '/products': { label: 'Products' },

  // Providers
  '/providers': { label: 'Providers' },

  // Vendors
  '/vendors': { label: 'Vendors' },

  // Inventory
  '/inventory': { label: 'Inventory' },
  '/inventory/warehouses': { label: 'Warehouses' },

  // Reports
  '/reports': { label: 'Reports' },
  '/reports/generate': { label: 'Generate Report' },

  // Routes
  '/routes': { label: 'Routes' },
  '/routes/id': { label: 'Route ID' }
}

export function getRouteLabel(path: string): string {
  const config = routeLabels[path]
  if (config) {
    return config.label
  }

  const segment = path.split('/').pop() || ''
  return formatSegmentLabel(segment)
}

export function shouldShowInBreadcrumb(path: string): boolean {
  const config = routeLabels[path]
  return config?.showInBreadcrumb !== false
}

function formatSegmentLabel(segment: string): string {
  if (!segment) return ''

  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function addRouteConfig(path: string, config: RouteConfig): void {
  routeLabels[path] = config
}
