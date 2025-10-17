import React, { PropsWithChildren } from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProvidersTable } from "./providers-table";

/* ───────────── Mocks tipados ───────────── */

vi.mock("next-intl", async () => {
  const actual = await vi.importActual<typeof import("next-intl")>("next-intl");
  return {
    ...actual,
    useTranslations: () => (key: string) => key, // devuelve la clave (sin namespace)
    NextIntlClientProvider: ({ children }: PropsWithChildren) => (
      <>{children}</>
    ),
  };
});

// Stub del modal para evitar portal y validar apertura/cierre
vi.mock("@/components/proveedores/create-provider-modal", () => ({
  __esModule: true,
  CreateProviderModal: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="provider-modal">
        modal abierto
        <button type="button" onClick={() => onOpenChange?.(false)}>
          close
        </button>
      </div>
    ) : null,
}));

/* ───────────── Utilidades tipadas ───────────── */

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithClient = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>);

// fetch tipado
type FetchResponse = { ok: boolean; json: () => Promise<unknown> };
type FetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<FetchResponse>;
const makeFetchMock = () => vi.fn<FetchFn>();

afterEach(() => {
  vi.clearAllMocks();
  (globalThis as { fetch?: typeof fetch }).fetch = undefined;
});

beforeEach(() => {
  // Asegúrate de no usar initialData del env
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = delete (process.env as Record<string, unknown>)
    .NEXT_PUBLIC_MOCK_DATA;
});

/* ───────────── Tests ───────────── */

describe("ProvidersTable (mínimo para cobertura, sin any)", () => {
  it("muestra Loading… y luego renderiza datos (éxito)", async () => {
    const rows = [
      {
        id: "1",
        name: "Alice",
        company: "Acme",
        nit: "N1",
        email: "a@x.com",
        phone: "111",
        address: "Street 1",
        country: "CO",
      },
      {
        id: "2",
        name: "Bob",
        company: "Globex",
        nit: "N2",
        email: "b@y.com",
        phone: "222",
        address: "Street 2",
        country: "US",
      },
    ];

    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => rows,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    renderWithClient(<ProvidersTable />);

    // estado inicial
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // datos cargados
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/providers");
      expect(screen.getByText("table.columns.name")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Globex")).toBeInTheDocument();
    });
  });

  it('muestra "no data" cuando API retorna [] y abre el modal al click', async () => {
    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    renderWithClient(<ProvidersTable />);

    // Espera directamente el contenido final (no solo la llamada a fetch)
    expect(await screen.findByText("table.noData")).toBeInTheDocument();

    // abre el modal
    fireEvent.click(screen.getByRole("button", { name: /table.addButton/i }));
    expect(screen.getByTestId("provider-modal")).toBeInTheDocument();

    // cerrar modal desde el stub
    fireEvent.click(screen.getByText("close"));
    await waitFor(() => {
      expect(screen.queryByTestId("provider-modal")).not.toBeInTheDocument();
    });
  });

  it("muestra mensaje de error cuando la consulta falla", async () => {
    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    renderWithClient(<ProvidersTable />);

    await waitFor(() => {
      expect(screen.getByText("Error loading providers.")).toBeInTheDocument();
    });
  });
});
