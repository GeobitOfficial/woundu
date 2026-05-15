import { type ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-tight transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 hover:text-white active:bg-slate-900 focus-visible:outline-slate-950 [&_svg]:text-white",
        secondary:
          "border border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-slate-300",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, size, variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}
