import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

type FieldVariant = "action" | "repair";

type FieldProps = ComponentPropsWithoutRef<"label"> & { variant?: FieldVariant };

export function Field({ variant = "action", className, ...props }: FieldProps) {
  return (
    <label
      {...props}
      className={cn(
        "mb-4.25 grid gap-1.75 [&>span]:font-bold [&>span]:text-[#475763]",
        "[&_small]:text-[11px] [&_small]:text-[#60717c]",
        variant === "action" ? "[&>span]:text-[12px]" : "[&>span]:text-[10.5px]",
        className,
      )}
    />
  );
}

const controlClassName = cn(
  "w-full rounded-[7px] border border-[#dbe3e8] bg-white px-2.75 text-[13px] text-[#2f3941] outline-none",
  "focus:border-[#8698a4] focus:shadow-[0_0_0_3px_#e4ebf1]",
  "max-[681px]:text-[16px]",
);

type InputProps = ComponentPropsWithoutRef<"input"> & { variant?: FieldVariant };

export function Input({ variant = "action", className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        controlClassName,
        "placeholder:text-[#99acba]",
        variant === "action" ? "h-11 min-h-11" : "h-10.25 max-w-85",
        className,
      )}
    />
  );
}

export function Select({ className, ...props }: ComponentPropsWithoutRef<"select">) {
  return (
    <select {...props} className={cn(controlClassName, "h-11 min-h-11", className)} />
  );
}

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        controlClassName,
        "h-auto min-h-22.5 resize-y p-2.75 leading-[1.6]",
        className,
      )}
    />
  );
}

export function FormHint({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      {...props}
      className={cn("-mt-2 mb-3.75 text-[11px] leading-[1.6] text-[#768590]", className)}
    />
  );
}
