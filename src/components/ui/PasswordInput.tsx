"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentPropsWithoutRef, useId, useState } from "react";

import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function PasswordInput({
  className,
  error,
  helperText,
  id,
  label,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const hasDescription = Boolean(error || helperText);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          aria-describedby={hasDescription ? descriptionId : undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-4 pr-12 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15",
            error &&
              "border-red-300 text-red-950 focus:border-red-400 focus:ring-red-500/10",
            className,
          )}
          id={inputId}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={isVisible ? "Ocultar contrasena" : "Mostrar contrasena"}
          aria-pressed={isVisible}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Eye aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      </div>
      {hasDescription ? (
        <p
          className={cn("text-xs leading-5 text-slate-500", error && "text-red-600")}
          id={descriptionId}
        >
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
}
