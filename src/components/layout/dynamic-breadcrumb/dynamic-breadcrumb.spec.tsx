import React, {
  PropsWithChildren,
  AnchorHTMLAttributes,
  HTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";

/* ✅ Mock next/navigation con tipos y acceso al mock */
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Traemos el mock tipado y obtenemos la función mockeada
const nav =
  await vi.importMock<typeof import("next/navigation")>("next/navigation");
const usePathname = vi.mocked(nav.usePathname);

/* ✅ Mock next/link tipado */
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={typeof href === "string" ? href : "#"}>{children}</a>
  ),
}));

/* ✅ Mock de UI breadcrumb tipado (sin any) */
// Nota: si tu alias "@/components/..." no está configurado, cambia a ruta relativa correspondiente.
vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: PropsWithChildren) => (
    <nav aria-label="breadcrumb">{children}</nav>
  ),
  BreadcrumbList: ({ children }: PropsWithChildren) => <ol>{children}</ol>,
  BreadcrumbItem: ({
    children,
    ...props
  }: PropsWithChildren<HTMLAttributes<HTMLLIElement>>) => (
    <li {...props}>{children}</li>
  ),
  BreadcrumbLink: ({ children }: PropsWithChildren) => <span>{children}</span>,
  BreadcrumbPage: ({ children }: PropsWithChildren) => <span>{children}</span>,
  BreadcrumbSeparator: ({ ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>/</span>
  ),
}));

/* ✅ Helpers tipados */
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

describe("DynamicBreadcrumb (coverage básico, sin any)", () => {
  it("no renderiza nada en ruta raíz (segments.length === 0)", () => {
    usePathname.mockReturnValue("/");
    const { container } = render(<DynamicBreadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza breadcrumb con separadores y últimos/no últimos segmentos", () => {
    usePathname.mockReturnValue("/products/123/details");
    render(<DynamicBreadcrumb />);

    expect(
      screen.getByRole("navigation", { name: /breadcrumb/i }),
    ).toBeInTheDocument();

    // "Home" + tres segmentos (Products / 123 / Details)
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();

    const seps = screen.getAllByText("/", { exact: true });
    expect(seps.length).toBeGreaterThanOrEqual(2);
  });
});
