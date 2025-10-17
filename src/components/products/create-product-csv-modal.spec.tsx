import React, { PropsWithChildren } from "react";
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateProductCSVModal } from "./create-product-csv-modal";
import { toast } from "sonner";

/* ─────────────────── Mocks tipados ─────────────────── */

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn<(msg?: unknown) => void>(),
    success: vi.fn<(msg?: unknown) => void>(),
  },
}));

vi.mock("next-intl", async () => {
  const actual = await vi.importActual<typeof import("next-intl")>("next-intl");
  return {
    ...actual,
    useTranslations: () => (key: string) => key,
    NextIntlClientProvider: ({ children }: PropsWithChildren) => (
      <>{children}</>
    ),
  };
});

/* ─────────────────── Helpers tipados ─────────────────── */

// ResizeObserver (evita warnings de UI libs en jsdom)
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
}
beforeAll(() => {
  // Tipado estricto del constructor global
  (
    window as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
});

// Query Client wrapper
const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>);

// Archivo CSV de prueba
const csv = (name = "products.csv") =>
  new File(["a,b\n1,2"], name, { type: "text/csv" });

// Fetch tipado
type FetchResponse = { ok: boolean; json: () => Promise<unknown> };
type FetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<FetchResponse>;
const makeFetchMock = () => vi.fn<FetchFn>();

afterEach(() => {
  vi.clearAllMocks();
  // limpiamos fetch para que cada test lo defina explícitamente
  (globalThis as { fetch?: typeof fetch }).fetch = undefined;
});

/* ─────────────────── Tests ─────────────────── */

describe("CreateProductCSVModal (mínimo para cobertura, sin any)", () => {
  it("render básico y cancel cierra", () => {
    const onOpenChange = vi.fn();
    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText("csvModal.title")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /csvModal.buttons.cancel/i }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("flujo feliz: selecciona CSV y envía OK", async () => {
    const onOpenChange = vi.fn();

    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 10 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />);

    // 1) Seleccionar archivo (se refleja el nombre)
    const fileInput = screen.getByTestId("csv-file-input") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [csv()] } });
    await waitFor(() =>
      expect(screen.getByText("products.csv")).toBeInTheDocument(),
    );

    // 2) Submit directo del formulario
    const form = screen.getByTestId("csv-form");
    fireEvent.submit(form);

    // 3) Se llamó fetch
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // 4) Validar argumentos
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/products/upload");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).credentials).toBe("include");
    expect((init as RequestInit).body).toBeInstanceOf(FormData);

    // 5) Éxito y cierre
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("csvModal.toastSuccess");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("error de servidor: muestra toast.error", async () => {
    const onOpenChange = vi.fn();

    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />);

    // 1) Seleccionar archivo
    const fileInput = screen.getByTestId("csv-file-input") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [csv()] } });

    // 2) Esperar nombre visible
    await waitFor(() =>
      expect(screen.getByText("products.csv")).toBeInTheDocument(),
    );

    // 3) Submit
    const form = screen.getByTestId("csv-form");
    fireEvent.submit(form);

    // 4) se llamó fetch
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    // 5) toast de error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("csvModal.toastError");
    });
  });
});
