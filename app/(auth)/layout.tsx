import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "../components/ui/icons";

export const metadata: Metadata = {
  title: "Account access | LSCCC Inventory",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f9faf9] lg:grid lg:grid-cols-[.95fr_1.05fr]">
      <section className="flex min-w-0 flex-col bg-[#edf2ef] px-6 py-6 sm:px-10 lg:min-h-dvh lg:px-14 lg:py-10 xl:px-20">
        <div className="flex items-center gap-3">
          <Image
            src="/lsccc-logo.jpg"
            alt="Lagos State Command and Control Centre crest"
            width={48}
            height={48}
            priority
            className="size-11 shrink-0 object-contain sm:size-12"
          />
          <div>
            <strong className="block text-lg leading-tight font-bold tracking-[-.04em]">
              LSCCC
            </strong>
            <span className="mt-1 block text-xs text-[#62736a]">Inventory workspace</span>
          </div>
        </div>
        <div className="hidden max-w-100 flex-1 flex-col justify-center py-16 lg:flex">
          <span className="mb-6 text-xs font-medium tracking-[.14em] text-[#607369] uppercase">
            Lagos State Command &amp; Control Centre
          </span>
          <h2 className="text-[40px] leading-[1.16] font-semibold tracking-[-.05em] text-[#243d31]">
            The right equipment.
            <br />
            In the right hands.
          </h2>
          <p className="mt-6 max-w-80 text-sm leading-7 text-[#607369]">
            A shared record of the equipment that keeps the centre working, from first
            delivery to every repair.
          </p>
          <ol className="mt-12 divide-y divide-[#d5dfd8] border-y border-[#d5dfd8]">
            {[
              { title: "Receive", description: "Keep stock accounted for." },
              { title: "Assign", description: "Know who holds each item." },
              { title: "Maintain", description: "Follow every repair through." },
            ].map((step, index) => (
              <li key={step.title} className="flex items-start gap-5 py-5">
                <span className="pt-0.5 text-xs text-[#82958a] tabular-nums">
                  0{index + 1}
                </span>
                <div>
                  <strong className="text-sm font-semibold text-[#365444]">
                    {step.title}
                  </strong>
                  <p className="mt-1 text-xs leading-6 text-[#607369]">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="hidden text-[11px] text-[#728579] lg:block">
          Lagos State · Staff workspace
        </p>
      </section>
      <main className="flex min-w-0 flex-col justify-center px-6 py-10 pb-[max(40px,env(safe-area-inset-bottom))] sm:px-10 sm:py-14 lg:px-14 xl:px-24">
        <div className="mx-auto w-full max-w-100">{children}</div>
        <div className="mx-auto mt-12 flex w-full max-w-100 items-center gap-2 text-[11px] text-muted">
          <Icon name="shield" size={14} />
          <span>For authorised LSCCC staff</span>
        </div>
      </main>
    </div>
  );
}
