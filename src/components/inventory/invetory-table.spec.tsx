import React, {
  PropsWithChildren,
  SVGProps,
  ButtonHTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryTable } from "./invetory-table";

/* ────────────── Mocks tipados (sin any) ────────────── */

// Iconos
vi.mock("lucide-react", () => ({
  Plus: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
}));

// i18n
vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
}));

// UI: button/table
vi.mock("../ui/button", () => ({
  Button: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../ui/table", () => ({
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

// Modal: hacemos visible `open`
interface MockAddModalProps {
  open: boolean;
}
vi.mock("./add-to-inventory-modal", () => ({
  AddToInventoryModal: ({ open }: MockAddModalProps) => (
    <div data-testid="add-modal" data-open={open ? "true" : "false"} />
  ),
}));

// React Query: mock tipado sencillo
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean };
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>();

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQuery(),
}));

/* ────────────── Tests ────────────── */

describe("InventoryTable (cobertura mínima, sin any)", () => {
  const origEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it("muestra Loading", () => {
    mockUseQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });
    render(<InventoryTable />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("muestra Error", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });
    render(<InventoryTable />);
    expect(screen.getByText("Error loading inventory.")).toBeInTheDocument();
  });

  it("muestra tabla con noData cuando data=[]", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [] as unknown[],
    });
    render(<InventoryTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("table.noData")).toBeInTheDocument();
  });

  it("renderiza filas y abre el modal al click", async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = "true";

    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 1,
          product_id: "P-001",
          warehouse_id: 10,
          total_quantity: 100,
          reserved_quantity: 5,
          batch_number: "L-77",
          expiration_date: "2026-01-01",
        },
      ],
    });

    render(<InventoryTable />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("P-001")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("L-77")).toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();

    const user = userEvent.setup();
    const addBtn = screen.getByRole("button");
    expect(screen.getByTestId("add-modal")).toHaveAttribute(
      "data-open",
      "false",
    );

    await user.click(addBtn);
    expect(screen.getByTestId("add-modal")).toHaveAttribute(
      "data-open",
      "true",
    );
  });
});
