import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";

// ✅ Mock de next/navigation (controlamos la ruta)
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));
const { usePathname } = await vi.importMock<any>("next/navigation");

// ✅ Mock de next/link (simple <a>)
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

// ✅ Mock de componentes UI para tener roles accesibles
vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: any) => (
    <nav aria-label="breadcrumb">{children}</nav>
  ),
  BreadcrumbList: ({ children }: any) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children, ...props }: any) => (
    <li {...props}>{children}</li>
  ),
  BreadcrumbLink: ({ children }: any) => <span>{children}</span>,
  BreadcrumbPage: ({ children }: any) => <span>{children}</span>,
  BreadcrumbSeparator: ({ ...props }: any) => <span {...props}>/</span>,
}));

// ✅ Mock de helpers (etiquetas y visibilidad siempre true)
//  - getRouteLabel: retorna el último segmento capitalizado para cubrir la llamada
vi.mock("@/lib/route-config", () => ({
  getRouteLabel: (p: string) => {
    const seg = p.split("/").filter(Boolean).pop() ?? "Home";
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  },
  shouldShowInBreadcrumb: () => true,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DynamicBreadcrumb (coverage básico)", () => {
  it("no renderiza nada en ruta raíz (segments.length === 0)", () => {
    usePathname.mockReturnValue("/"); // => return null en el componente
    const { container } = render(<DynamicBreadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza breadcrumb con separadores y últimos/no últimos segmentos", () => {
    usePathname.mockReturnValue("/products/123/details");
    render(<DynamicBreadcrumb />);

    // <nav aria-label="breadcrumb"> existe
    expect(
      screen.getByRole("navigation", { name: /breadcrumb/i }),
    ).toBeInTheDocument();

    // "Home" + tres segmentos (Products / 123 / Details)
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();

    // Hay separadores entre segmentos (dos separadores visibles + uno antes del último)
    // Nota: Breadcrumb inserta separador antes de cada segmento mostrado
    const seps = screen.getAllByText("/", { exact: true });
    expect(seps.length).toBeGreaterThanOrEqual(2);
  });
});
