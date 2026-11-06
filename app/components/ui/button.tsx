import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
  size?: "default" | "compact";
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "default",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[7px] border text-[11.5px] font-bold whitespace-nowrap",
        "transition-[background,border-color,transform,box-shadow] duration-160",
        variant === "primary"
          ? "border-primary bg-primary text-white shadow-none hover:border-[#1c303b] hover:bg-[#1c303b]"
          : "border-[#dae2e7] bg-white text-[#323e46] hover:border-[#9bafbd] hover:bg-[#f8fbf8]",
        size === "compact" ? "h-8.75 px-3" : "h-9.5 px-3.5 max-[391px]:px-2.25",
        "max-[391px]:text-[10.5px]",
        fullWidth && "mt-6.25 w-full",
        className,
      )}
    />
  );
}
