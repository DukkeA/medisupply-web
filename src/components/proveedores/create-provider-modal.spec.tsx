import React, { PropsWithChildren } from "react";
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateProviderModal } from "./create-provider-modal";
import { toast } from "sonner";

/* ──────────────── Mocks tipados ──────────────── */
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
    // devuelve la clave (sin namespace)
    useTranslations: () => (key: string) => key,
    NextIntlClientProvider: ({ children }: PropsWithChildren) => (
      <>{children}</>
    ),
  };
});

type Country = { name: string };
vi.mock("../ui/location-input", () => ({
  __esModule: true,
  default: ({
    onCountryChange,
  }: {
    onCountryChange?: (c: Country) => void;
  }) => (
    <button
      type="button"
      aria-label="select-country"
      onClick={() => onCountryChange?.({ name: "Colombia" })}
    >
      select-country
    </button>
  ),
}));

/* ──────────────── Helpers tipados ──────────────── */

// ResizeObserver para jsdom
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
}
beforeAll(() => {
  (
    window as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
});

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrap = (ui: React.ReactNode) =>
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

/* ──────────────── Utilidades del test ──────────────── */
const fillBasics = () => {
  fireEvent.change(screen.getByLabelText("modal.fields.name"), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByLabelText("modal.fields.company"), {
    target: { value: "Acme" },
  });
  fireEvent.change(screen.getByLabelText("modal.fields.nit"), {
    target: { value: "123" },
  });
  fireEvent.change(screen.getByLabelText("modal.fields.email"), {
    target: { value: "john@example.com" },
  });
  fireEvent.change(screen.getByLabelText("modal.fields.phone"), {
    target: { value: "+1 234" },
  });
  fireEvent.change(screen.getByLabelText("modal.fields.address"), {
    target: { value: "Main St" },
  });
  fireEvent.click(screen.getByRole("button", { name: /select-country/i })); // mock LocationSelector
};

/* ──────────────── Tests ──────────────── */
describe("CreateProviderModal (mínimo para cobertura, sin any)", () => {
  it("render básico y cierra con Cancel", () => {
    const onOpenChange = vi.fn();
    wrap(<CreateProviderModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText("modal.title")).toBeInTheDocument();
    expect(screen.getByText("modal.description")).toBeInTheDocument();

    const form = screen.getByTestId("provider-form") as HTMLFormElement;
    expect(form).toBeTruthy();

    fireEvent.click(screen.getByTestId("cancel-provider"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("flujo feliz: completa campos, envía y muestra toast.success", async () => {
    const onOpenChange = vi.fn();

    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    wrap(<CreateProviderModal open={true} onOpenChange={onOpenChange} />);

    fillBasics();

    const form = screen.getByTestId("provider-form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/providers");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).credentials).toBe("include");
    expect((init as RequestInit).headers).toEqual(
      expect.objectContaining({ "Content-Type": "application/json" }),
    );
    expect(typeof (init as RequestInit).body).toBe("string");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("modal.toastSuccess");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("error del servidor: muestra toast.error", async () => {
    const onOpenChange = vi.fn();

    const fetchMock = makeFetchMock();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    wrap(<CreateProviderModal open={true} onOpenChange={onOpenChange} />);

    fillBasics();

    const form = screen.getByTestId("provider-form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("modal.toastError"),
    );
  });
});
