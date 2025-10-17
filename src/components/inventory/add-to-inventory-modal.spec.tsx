import React, {
  PropsWithChildren,
  SVGProps,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToInventoryModal } from "./add-to-inventory-modal";

/* ───────────────────── Mocks tipados ───────────────────── */

// i18n: retorna la clave tal cual
vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

// Íconos
vi.mock("lucide-react", () => ({
  CalendarIcon: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
  Check: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
  ChevronsUpDown: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
}));

// util classnames (usa path relativo para evitar alias @)
vi.mock("../../utils/classNames", () => ({
  cn: (...a: unknown[]) => a.filter(Boolean).join(" "),
}));

// UI shadcn: componentes simples con roles accesibles
vi.mock("../ui/button", () => ({
  Button: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../ui/dialog", () => ({
  Dialog: ({ children }: PropsWithChildren) => (
    <div role="dialog">{children}</div>
  ),
  DialogContent: ({
    children,
    ...p
  }: PropsWithChildren<Record<string, unknown>>) => (
    <div {...p}>{children}</div>
  ),
  DialogHeader: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: PropsWithChildren) => <h2>{children}</h2>,
  DialogDescription: ({ children }: PropsWithChildren) => <p>{children}</p>,
  DialogFooter: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("../ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("../ui/label", () => ({
  Label: ({
    htmlFor,
    children,
  }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock("../ui/popover", () => ({
  Popover: ({ children }: PropsWithChildren) => <div>{children}</div>,
  PopoverTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,
  PopoverContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

type CommandItemProps = PropsWithChildren<{
  onSelect?: (value: string) => void;
}>;
vi.mock("../ui/command", () => ({
  Command: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CommandInput: (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  CommandList: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CommandEmpty: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CommandGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
  // Hace de botón para disparar onSelect
  CommandItem: ({ children, onSelect }: CommandItemProps) => (
    <button type="button" onClick={() => onSelect?.("")}>
      {children}
    </button>
  ),
}));

// Calendar: botón que llama onSelect con una fecha
type CalendarProps = { onSelect?: (date: Date) => void };
vi.mock("../ui/calendar", () => ({
  Calendar: ({ onSelect }: CalendarProps) => (
    <button type="button" onClick={() => onSelect?.(new Date("2026-01-01"))}>
      calendar
    </button>
  ),
}));

/* ───────────────── React Query mocks (tipados) ───────────────── */

type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean };

// useQuery: no necesitamos reenviar args → firma simple y tipada
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>();
const mockInvalidate = vi.fn();

// Tipado de opciones de mutación que nos interesan
type MutationOptions<Vars> = {
  onSuccess?: (data: unknown, variables: Vars, context?: unknown) => void;
  onError?: (err: unknown) => void;
};

let lastMutationOptions: MutationOptions<unknown> | undefined;
let mutationIsPending = false;

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQuery(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
  useMutation: <Vars,>(opts: MutationOptions<Vars>) => {
    lastMutationOptions = opts as MutationOptions<unknown>;
    return {
      mutate: (vars: Vars) => opts.onSuccess?.({ ok: true }, vars, undefined),
      isPending: mutationIsPending,
    };
  },
}));

/* ───────────────── Toast (tipado) ───────────────── */
const toastSuccess = vi.fn<(msg?: unknown) => void>();
const toastError = vi.fn<(msg?: unknown) => void>();
vi.mock("sonner", () => ({
  toast: {
    success: (msg?: unknown) => toastSuccess(msg),
    error: (msg?: unknown) => toastError(msg),
  },
}));

/* ───────────────── Setup ───────────────── */
beforeEach(() => {
  vi.clearAllMocks();
  mutationIsPending = false;

  // Por defecto, queries con datos para cubrir mapeos
  mockUseQuery.mockImplementation(() => {
    // devolvemos ambos datasets porque el componente hace dos useQuery distintos
    // y al test solo le interesa que existan datos
    return { data: [{ id: "dummy" }], isLoading: false, isError: false };
  });
});

/* ───────────────── Tests ───────────────── */
describe("AddToInventoryModal (cobertura mínima, sin any)", () => {
  it("renderiza y envía el formulario (onSuccess)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<AddToInventoryModal open={true} onOpenChange={onOpenChange} />);

    // Título/Descripción (claves i18n)
    expect(screen.getByText("modal.title")).toBeInTheDocument();
    expect(screen.getByText("modal.description")).toBeInTheDocument();

    // Seleccionar producto: primer botón (trigger) → luego primer CommandItem
    const productTrigger = screen.getAllByRole("button")[0];
    await user.click(productTrigger);
    const firstCommandItem = screen.getAllByRole("button")[1];
    await user.click(firstCommandItem);

    // Seleccionar warehouse: reutilizamos el patrón
    const warehouseTrigger = screen.getAllByRole("button")[0];
    await user.click(warehouseTrigger);
    const secondCommandItem = screen.getAllByRole("button")[1];
    await user.click(secondCommandItem);

    // Inputs
    await user.type(screen.getByLabelText("modal.fields.totalQuantity"), "100");
    await user.type(
      screen.getByLabelText("modal.fields.reservedQuantity"),
      "5",
    );
    await user.type(screen.getByLabelText("modal.fields.batchNumber"), "L-77");

    // Fecha
    await user.click(screen.getByText("calendar"));

    // Submit (último botón)
    const allButtons = screen.getAllByRole("button");
    const submitBtn = allButtons[allButtons.length - 1];
    await user.click(submitBtn);

    // onSuccess
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ["inventory"] });
    expect(toastSuccess).toHaveBeenCalled();
  });

  it("muestra estado pending (botones deshabilitados) y ejecuta onError", async () => {
    const onOpenChange = vi.fn();

    // Forzar isPending
    mutationIsPending = true;

    render(<AddToInventoryModal open={true} onOpenChange={onOpenChange} />);

    const allButtons = screen.getAllByRole("button");
    const cancelBtn = allButtons.find(
      (b) => b.textContent === "modal.buttons.cancel",
    )!;
    const submitBtn = allButtons.find(
      (b) =>
        b.textContent === "modal.buttons.create" ||
        b.textContent === "modal.buttons.creating",
    )!;

    expect(cancelBtn).toBeDisabled();
    expect(submitBtn).toBeDisabled();

    // Dispara onError manualmente para cubrir la rama
    lastMutationOptions?.onError?.(new Error("fail"));
    expect(toastError).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
