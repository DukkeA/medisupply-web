// REEMPLAZA TODO EL CONTENIDO DE este archivo con lo siguiente:
import React, {
  PropsWithChildren,
  SVGProps,
  ButtonHTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WarehousesTable } from "./warehouses-table";

/* ─────────── Mocks tipados ─────────── */

// i18n: devuelve la clave tal cual
vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

// lucide: incluye los íconos que usan tus UI (incluye XIcon por Dialog)
vi.mock("lucide-react", () => {
  const Svg = (p: SVGProps<SVGSVGElement>) => <svg {...p} />;
  return {
    Plus: Svg,
    CalendarIcon: Svg,
    Check: Svg,
    ChevronsUpDown: Svg,
    XIcon: Svg,
  };
});

// UI básicos (button/table) sin any
vi.mock("../../ui/button", () => ({
  Button: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("../../ui/table", () => ({
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

// Mock del modal correcto: CreateWarehouseModal (NO add-to-inventory)
vi.mock("./create-warehouse-modal", () => ({
  CreateWarehouseModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-warehouse-modal"
      data-open={open ? "true" : "false"}
    />
  ),
}));

/* ─────────── React Query (solo useQuery) ─────────── */
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean };
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>();

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQuery(),
}));

/* ─────────── Tests ─────────── */
describe("WarehousesTable (cobertura mínima, sin any)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra Loading", () => {
    mockUseQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });
    render(<WarehousesTable />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("muestra Error", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });
    render(<WarehousesTable />);
    expect(screen.getByText("Error loading warehouses.")).toBeInTheDocument();
  });

  it("renderiza tabla y noData cuando data=[]", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [] as unknown[],
    });
    render(<WarehousesTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("table.noData")).toBeInTheDocument();
  });

  it("renderiza filas y abre el modal al click del botón", async () => {
    const user = userEvent.setup();
    process.env.NEXT_PUBLIC_MOCK_DATA = "true";

    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 1,
          name: "Main WH",
          address: "123 St",
          country: "CO",
          city: "Bogotá",
        },
      ],
    });

    render(<WarehousesTable />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Main WH")).toBeInTheDocument();
    expect(screen.getByText("Bogotá")).toBeInTheDocument();
    expect(screen.getByText("CO")).toBeInTheDocument();
    expect(screen.getByText("123 St")).toBeInTheDocument();

    // Botón "Agregar" (único button en el header)
    const addBtn = screen.getByRole("button");
    // El modal mockeado empieza cerrado
    expect(screen.getByTestId("create-warehouse-modal")).toHaveAttribute(
      "data-open",
      "false",
    );

    await user.click(addBtn);
    expect(screen.getByTestId("create-warehouse-modal")).toHaveAttribute(
      "data-open",
      "true",
    );
  });
});
