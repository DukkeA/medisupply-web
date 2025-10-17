import React, {
  PropsWithChildren,
  SVGProps,
  ButtonHTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VendorPlansTable } from "./vendor-plans-table";

/* ────────── Mocks tipados ────────── */

// i18n
vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
}));

// Icono
vi.mock("lucide-react", () => ({
  Plus: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
}));

// UI shadcn basics
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: PropsWithChildren) => <table>{children}</table>,
  TableHeader: ({ children }: PropsWithChildren) => <thead>{children}</thead>,
  TableBody: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
  TableRow: ({
    children,
    ...props
  }: PropsWithChildren<Record<string, unknown>>) => (
    <tr {...props}>{children}</tr>
  ),
  TableHead: ({ children }: PropsWithChildren) => <th>{children}</th>,
  TableCell: ({
    children,
    ...props
  }: PropsWithChildren<Record<string, unknown>>) => (
    <td {...props}>{children}</td>
  ),
}));

// Modal: exponer estado de apertura
vi.mock("./create-vendor-plan-modal", () => ({
  CreateVendorPlanModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-vendor-plan-modal"
      data-open={open ? "true" : "false"}
    />
  ),
}));

// React Query: dos useQuery en el componente (orden: vendorPlans, vendors)
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean };
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>();

vi.mock("@tanstack/react-query", () => {
  const defaultQuery: UseQueryResult<unknown> = {
    isLoading: false,
    isError: false,
    data: [],
  };
  return {
    useQuery: () => mockUseQuery() ?? defaultQuery,
  };
});

/* ────────── Tests ────────── */

describe("VendorPlansTable (cobertura mínima, sin any)", () => {
  const origEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...origEnv };
  });

  it("muestra Loading...", () => {
    // 1ª llamada (vendorPlans)
    mockUseQuery
      .mockReturnValueOnce({ isLoading: true, isError: false, data: undefined })
      // 2ª llamada (vendors)
      .mockReturnValueOnce({ isLoading: false, isError: false, data: [] });

    render(<VendorPlansTable />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("muestra mensaje de error", () => {
    mockUseQuery
      .mockReturnValueOnce({ isLoading: false, isError: true, data: undefined })
      .mockReturnValueOnce({ isLoading: false, isError: false, data: [] });

    render(<VendorPlansTable />);
    expect(screen.getByText("Error loading vendor plans.")).toBeInTheDocument();
  });

  it("renderiza tabla y noResults cuando vendorPlans=[]", () => {
    mockUseQuery
      // vendorPlans vacío
      .mockReturnValueOnce({ isLoading: false, isError: false, data: [] })
      // vendors (no usado en esta rama, pero lo devolvemos por completar)
      .mockReturnValueOnce({ isLoading: false, isError: false, data: [] });

    render(<VendorPlansTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("noResults")).toBeInTheDocument();
  });

  it("renderiza filas (formatea moneda, resuelve nombre y status class) y abre el modal", async () => {
    // cubrir rama de initialData leída por el spread del env
    process.env.NEXT_PUBLIC_MOCK_DATA = "true";

    // vendorPlans con 1 fila + vendors con 1 coincidencia
    mockUseQuery
      .mockReturnValueOnce({
        isLoading: false,
        isError: false,
        data: [
          {
            id: 1,
            vendor_id: 10,
            period: "2025-Q1",
            goal: 100000,
            actual: 120000,
            status: "On Track",
          },
        ],
      })
      .mockReturnValueOnce({
        isLoading: false,
        isError: false,
        data: [{ id: 10, name: "Vendor X" }],
      });

    // Fallback para cualquier llamada extra (por re-render)
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(<VendorPlansTable />);

    // tabla
    expect(screen.getByRole("table")).toBeInTheDocument();

    // vendor name resuelto por getVendorName
    expect(screen.getByText("Vendor X")).toBeInTheDocument();

    // period
    expect(screen.getByText("2025-Q1")).toBeInTheDocument();

    // moneda (en-US, USD) → $100,000.00 y $120,000.00
    expect(screen.getByText("$100,000.00")).toBeInTheDocument();
    expect(screen.getByText("$120,000.00")).toBeInTheDocument();

    // status con className de getStatusColor('On Track') => 'text-blue-600 font-semibold'
    const statusCell = screen.getByText("On Track");
    expect(statusCell).toBeInTheDocument();
    expect(statusCell).toHaveAttribute(
      "class",
      expect.stringContaining("text-blue-600"),
    );

    // modal: inicia cerrado y se abre al click
    const addBtn = screen.getByRole("button");
    expect(screen.getByTestId("create-vendor-plan-modal")).toHaveAttribute(
      "data-open",
      "false",
    );
    const user = userEvent.setup();
    await user.click(addBtn);
    expect(screen.getByTestId("create-vendor-plan-modal")).toHaveAttribute(
      "data-open",
      "true",
    );
  });
});
