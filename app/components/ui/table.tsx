import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

export function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <table
      {...props}
      className={cn(
        "w-full min-w-180 border-collapse [&_thead]:bg-[#f8faf8]",
        "[&_th]:h-10.5 [&_th]:px-4 [&_th]:text-left [&_th]:text-[9.5px]",
        "[&_th]:font-bold [&_th]:tracking-[.05em] [&_th]:whitespace-nowrap [&_th]:text-[#7d8d98]",
        "[&_td]:border-t [&_td]:border-t-[#e4ebf1] [&_td]:px-4 [&_td]:py-3.25",
        "[&_td]:text-[11.5px] [&_td]:whitespace-nowrap [&_td]:text-[#3e4c56]",
        "[&_td_strong]:text-[11.5px] [&_td_strong]:font-[710] [&_td_strong]:text-[#283138]",
        "[&_:where(td_small)]:mt-1.25 [&_td_small]:block [&_td_small]:text-[9.5px] [&_td_small]:text-[#8a9ba8]",
        className,
      )}
    />
  );
}
