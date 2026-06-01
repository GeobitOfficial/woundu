import { type ComponentPropsWithoutRef, useId } from "react";

import { cn } from "@/lib/utils";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function Input({
  className,
  error,
  helperText,
  id,
  label,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const hasDescription = Boolean(error || helperText);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={hasDescription ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15",
          error &&
            "border-red-300 text-red-950 focus:border-red-400 focus:ring-red-500/10",
          className,
        )}
        id={inputId}
        {...props}
      />
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
