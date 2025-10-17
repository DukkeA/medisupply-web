import React, {
  PropsWithChildren,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  HTMLAttributes,
  SVGProps,
} from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateVendorPlanModal } from "./create-vendor-plan-modal";

/* ──────────────── Mocks tipados ──────────────── */

// i18n
vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
}));

// Icons
vi.mock("lucide-react", () => {
  const Svg = (p: SVGProps<SVGSVGElement>) => <svg {...p} />;
  return { Check: Svg, ChevronsUpDown: Svg };
});

// cn util
vi.mock("@/utils/classNames", () => ({
  cn: (...xs: string[]) => xs.filter(Boolean).join(" "),
}));

// UI: button / dialog / input / label
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: PropsWithChildren) => (
    <div role="dialog">{children}</div>
  ),
  DialogContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: PropsWithChildren) => <h2>{children}</h2>,
  DialogDescription: ({ children }: PropsWithChildren) => <p>{children}</p>,
  DialogFooter: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));
vi.mock("@/components/ui/label", () => ({
  Label: ({
    htmlFor,
    children,
  }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

// Command & Popover (selector de vendor)
vi.mock("@/components/ui/command", () => ({
  Command: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CommandInput: (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  CommandList: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CommandEmpty: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CommandGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
  // CommandItem como botón que dispara onSelect
  CommandItem: ({
    children,
    onSelect,
    ...rest
  }: PropsWithChildren<
    { onSelect?: (v?: string) => void } & HTMLAttributes<HTMLButtonElement>
  >) => (
    <button type="button" onClick={() => onSelect?.("")} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: PropsWithChildren) => <div>{children}</div>,
  PopoverTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,
  PopoverContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

// Toast
const toastSuccess = vi.fn<(msg?: unknown) => void>();
const toastError = vi.fn<(msg?: unknown) => void>();
vi.mock("sonner", () => ({
  toast: {
    success: (m?: unknown) => toastSuccess(m),
    error: (m?: unknown) => toastError(m),
  },
}));

/* ──────────────── React Query mocks ──────────────── */

// useQuery (vendors) + useMutation + useQueryClient
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean };
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>();
const mockInvalidate = vi.fn();

type MutationOptions<Vars> = {
  onSuccess?: (data: unknown, vars: Vars, ctx?: unknown) => void;
  onError?: (err: unknown) => void;
};
let mutationIsPending = false;
let lastMutationOptions: MutationOptions<unknown> | undefined;

vi.mock("@tanstack/react-query", () => {
  const defaultQuery: UseQueryResult<unknown> = {
    isLoading: false,
    isError: false,
    data: [],
  };
  return {
    useQuery: () => mockUseQuery() ?? defaultQuery,
    useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
    useMutation: <Vars,>(opts: MutationOptions<Vars>) => {
      lastMutationOptions = opts as MutationOptions<unknown>;
      return {
        mutate: (vars: Vars) => opts.onSuccess?.({}, vars, undefined),
        isPending: mutationIsPending,
      };
    },
  };
});

/* ──────────────── Tests ──────────────── */

describe("CreateVendorPlanModal (cobertura mínima, sin any)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationIsPending = false;
    lastMutationOptions = undefined;
    // por defecto, hay vendors
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [{ id: 10, name: "Vendor X" }],
    });
  });

  it("renderiza título/descr y permite cancelar", () => {
    const onOpenChange = vi.fn();
    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText("createTitle")).toBeInTheDocument();
    expect(screen.getByText("createDescription")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: "cancel" });
    fireEvent.click(cancelBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("selecciona vendor, llena campos, submit → onSuccess (invalidate + toast + close + reset)", () => {
    const onOpenChange = vi.fn();
    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />);

    // Abrir selector (en el mock, basta con hacer click en el "combobox" = Button)
    const vendorCombobox = screen.getByRole("button", {
      name: /selectVendor/i,
    });
    fireEvent.click(vendorCombobox);

    // Elegir primer CommandItem (nuestro mock lo renderiza como <button>)
    const cmdButtons = screen.getAllByRole("button");
    // el primero suele ser el propio combobox; buscamos el que tenga el texto del vendor
    const item =
      cmdButtons.find((b) => b.textContent === "Vendor X") ?? cmdButtons[1];
    fireEvent.click(item);

    // Llenar form
    fireEvent.change(screen.getByLabelText("period"), {
      target: { value: "2025-Q1" },
    });
    fireEvent.change(screen.getByLabelText("goal"), {
      target: { value: "100000" },
    });
    fireEvent.change(screen.getByLabelText("actual"), {
      target: { value: "90000" },
    });

    // Cambiar status (select nativo)
    const statusSelect = screen.getByLabelText("status") as HTMLSelectElement;
    expect(statusSelect.value).toBe("On Track");
    fireEvent.change(statusSelect, { target: { value: "Exceeded" } });
    expect(statusSelect.value).toBe("Exceeded");

    // Submit
    const submitBtn = screen.getByRole("button", { name: /create|creating/ });
    fireEvent.click(submitBtn);

    // onSuccess
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ["vendorPlans"] });
    expect(toastSuccess).toHaveBeenCalledWith("createSuccess");
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // al hacer reset, el select vuelve a 'On Track'
    expect((screen.getByLabelText("status") as HTMLSelectElement).value).toBe(
      "On Track",
    );
  });

  it("submit sin vendor seleccionado → muestra toast de error (selectVendor) y no llama mutate", () => {
    const onOpenChange = vi.fn();
    // Forzamos vendors pero NO se selecciona ninguno (selectedVendorId null)
    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />);

    // Llenar campos requeridos
    fireEvent.change(screen.getByLabelText("period"), {
      target: { value: "2025-Q1" },
    });
    fireEvent.change(screen.getByLabelText("goal"), {
      target: { value: "100000" },
    });
    fireEvent.change(screen.getByLabelText("actual"), {
      target: { value: "90000" },
    });

    const submitBtn = screen.getByRole("button", { name: /create|creating/ });
    fireEvent.click(submitBtn);

    expect(toastError).toHaveBeenCalledWith("selectVendor");
    // y no debería haberse cerrado el modal
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("estado pending: botones disabled y onError dispara toast.error", () => {
    const onOpenChange = vi.fn();
    mutationIsPending = true;

    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />);

    const cancelBtn = screen.getByRole("button", { name: "cancel" });
    const submitBtn = screen.getByRole("button", { name: /create|creating/ });
    expect(cancelBtn).toBeDisabled();
    expect(submitBtn).toBeDisabled();

    // Disparar onError manualmente para cubrir la rama
    lastMutationOptions?.onError?.(new Error("fail"));
    expect(toastError).toHaveBeenCalledWith("createError");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
