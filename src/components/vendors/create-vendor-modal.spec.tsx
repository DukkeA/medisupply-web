import React, {
  PropsWithChildren,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateVendorModal } from "./create-vendor-modal";

/* ─────────────────── Mocks tipados ─────────────────── */

// i18n
vi.mock("next-intl", () => ({
  useTranslations: () => (k: string) => k,
}));

// UI shadcn: Button / Dialog / Input / Label (roles accesibles y sin portals)
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

// Toast
const toastSuccess = vi.fn<(msg?: unknown) => void>();
const toastError = vi.fn<(msg?: unknown) => void>();
vi.mock("sonner", () => ({
  toast: {
    success: (m?: unknown) => toastSuccess(m),
    error: (m?: unknown) => toastError(m),
  },
}));

// LocationSelector: expone 2 botones para disparar onCountryChange y onStateChange
type CountryOrState = { name: string };
vi.mock("../ui/location-input", () => ({
  __esModule: true,
  default: ({
    onCountryChange,
    onStateChange,
    countryLabel,
    stateLabel,
    showStates,
  }: {
    onCountryChange?: (c?: CountryOrState) => void;
    onStateChange?: (s?: CountryOrState) => void;
    countryLabel?: string;
    stateLabel?: string;
    showStates?: boolean;
  }) => (
    <div>
      <button
        type="button"
        aria-label={countryLabel ?? "country"}
        onClick={() => onCountryChange?.({ name: "Colombia" })}
      >
        select-country
      </button>
      {showStates ? (
        <button
          type="button"
          aria-label={stateLabel ?? "state"}
          onClick={() => onStateChange?.({ name: "Andina" })}
        >
          select-state
        </button>
      ) : null}
    </div>
  ),
}));

/* ─────────────────── React Query (mocks tipados) ─────────────────── */

const mockInvalidate = vi.fn();

type MutationOptions<Vars> = {
  onSuccess?: (data: unknown, vars: Vars, ctx?: unknown) => void;
  onError?: (err: unknown) => void;
};
let mutationIsPending = false;
let lastMutationOptions: MutationOptions<Record<string, unknown>> | undefined;

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
  useMutation: <Vars,>(opts: MutationOptions<Vars>) => {
    lastMutationOptions = opts as MutationOptions<Record<string, unknown>>;
    return {
      mutate: (vars: Vars) => opts.onSuccess?.({}, vars, undefined),
      isPending: mutationIsPending,
    };
  },
}));

/* ─────────────────── Tests ─────────────────── */

describe("CreateVendorModal (cobertura mínima, sin any)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationIsPending = false;
    lastMutationOptions = undefined;
  });

  it("renderiza título/descr, permite cancelar (onOpenChange(false))", () => {
    const onOpenChange = vi.fn();
    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText("modal.title")).toBeInTheDocument();
    expect(screen.getByText("modal.description")).toBeInTheDocument();

    // botón cancelar
    const cancelBtn = screen.getByRole("button", {
      name: "modal.buttons.cancel",
    });
    fireEvent.click(cancelBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("flujo feliz: completa campos, selecciona country/state, submit → onSuccess", () => {
    const onOpenChange = vi.fn();
    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />);

    // Inputs por label
    fireEvent.change(screen.getByLabelText("modal.fields.name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("modal.fields.email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("modal.fields.phone"), {
      target: { value: "+57 123" },
    });

    // LocationSelector (country/state)
    fireEvent.click(
      screen.getByRole("button", { name: "modal.fields.country" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "modal.fields.territory" }),
    );

    // Submit
    const submitBtn = screen.getByRole("button", {
      name: /modal\.buttons\.create|modal\.buttons\.creating/,
    });
    fireEvent.click(submitBtn);

    // onSuccess → cierra modal, invalida query y muestra toast.success
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ["vendors"] });
    expect(toastSuccess).toHaveBeenCalledWith("modal.toastSuccess");
  });

  it("estado pending: botones deshabilitados y onError muestra toast.error", () => {
    const onOpenChange = vi.fn();
    mutationIsPending = true;

    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />);

    const cancelBtn = screen.getByRole("button", {
      name: "modal.buttons.cancel",
    });
    const submitBtn = screen.getByRole("button", {
      name: /modal\.buttons\.create|modal\.buttons\.creating/,
    });

    expect(cancelBtn).toBeDisabled();
    expect(submitBtn).toBeDisabled();

    // Disparar explícitamente la rama de error de la mutación
    lastMutationOptions?.onError?.(new Error("fail"));
    expect(toastError).toHaveBeenCalledWith("modal.toastError");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
