import React, {
  PropsWithChildren,
  SVGProps,
  ButtonHTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VendorsTable } from "./vendors-table";

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
vi.mock("@/components/vendors/create-vendor-modal", () => ({
  CreateVendorModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-vendor-modal"
      data-open={open ? "true" : "false"}
    />
  ),
}));

// React Query: solo useQuery
type UseQueryResult<T> = { data: T; isLoading: boolean; isError: boolean };
const mockUseQuery = vi.fn<() => UseQueryResult<unknown[]>>();

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQuery(),
}));

/* ────────── Tests ────────── */

describe("VendorsTable (cobertura mínima, sin any)", () => {
  const origEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it("muestra Loading...", () => {
    mockUseQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: [],
    });
    render(<VendorsTable />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("muestra mensaje de error", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      data: [],
    });
    render(<VendorsTable />);
    expect(screen.getByText("Error loading vendors.")).toBeInTheDocument();
  });

  it("renderiza tabla y noData cuando data=[]", () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
    render(<VendorsTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("table.noData")).toBeInTheDocument();
  });

  it("renderiza filas y abre el modal al click", async () => {
    // cubre la rama del spread de initialData leyendo la env var
    process.env.NEXT_PUBLIC_MOCK_DATA = "true";

    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: "v1",
          name: "Alice",
          email: "alice@x.com",
          phone: "111",
          country: "CO",
          territory: "Andina",
        },
      ],
    });

    render(<VendorsTable />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@x.com")).toBeInTheDocument();
    expect(screen.getByText("111")).toBeInTheDocument();
    expect(screen.getByText("CO")).toBeInTheDocument();
    expect(screen.getByText("Andina")).toBeInTheDocument();

    const addBtn = screen.getByRole("button");
    expect(screen.getByTestId("create-vendor-modal")).toHaveAttribute(
      "data-open",
      "false",
    );

    const user = userEvent.setup();
    await user.click(addBtn);

    expect(screen.getByTestId("create-vendor-modal")).toHaveAttribute(
      "data-open",
      "true",
    );
  });
});
