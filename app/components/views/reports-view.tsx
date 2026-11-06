import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Icon } from "../ui/icons";
import { formatDate } from "../../lib/demo-data";
import { today } from "../../lib/workspace-utils";
import { Metric } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<
  WorkspaceViewProps,
  | "state"
  | "held"
  | "available"
  | "issued"
  | "faulty"
  | "openFaults"
  | "lowStock"
  | "navigate"
>;

export function ReportsView({
  state,
  held,
  available,
  issued,
  faulty,
  openFaults,
  lowStock,
  navigate,
}: Props) {
  return (
    <>
      <div
        className={cn(
          "mb-5 flex justify-between gap-5 rounded-[11px] border border-[#dee6eb] bg-[#e5ecf2] px-6.75 py-6",
          "[&_h2]:mt-1.75 [&_h2]:text-[22px]",
          "[&_p]:mt-1.75 [&_p]:text-[11px] [&_p]:text-[#71808a]",
          "max-md:flex-col",
        )}
      >
        <div>
          <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
            OPERATIONS SNAPSHOT
          </span>
          <h2>Stock health at a glance</h2>
          <p>Use these live totals for daily handovers and monthly reporting.</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 self-start text-[10px] whitespace-nowrap text-[#6a7781]",
            "max-md:self-auto",
          )}
        >
          <Icon name="clock" size={17} />
          {formatDate(today(), true)}
        </div>
      </div>
      <div
        className={cn(
          "mx-0 mt-4.5 mb-8.75 grid grid-cols-4 gap-3.5",
          "max-md:mx-0 max-md:mt-3.25 max-md:mb-7 max-md:grid-cols-2 max-md:gap-2.25",
          "max-[391px]:grid-cols-[1fr_1fr]",
        )}
      >
        <Metric icon="box" label="Total held" value={held} note="All equipment types" />
        <Metric
          icon="check"
          label="Available"
          value={available}
          note={`${Math.round(held ? (available / held) * 100 : 0)}% of total stock`}
          tone="green"
        />
        <Metric
          icon="users"
          label="Issued"
          value={issued}
          note={`${Math.round(held ? (issued / held) * 100 : 0)}% of total stock`}
        />
        <Metric
          icon="tool"
          label="Faulty"
          value={faulty}
          note={`${openFaults.length} open reports`}
          tone="amber"
        />
      </div>
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1.5fr)_minmax(270px,1fr)] gap-3.75",
          "max-md:grid-cols-[1fr]",
        )}
      >
        <section
          className={cn(
            "rounded-[10px] border border-line bg-white px-5.75 py-5.75",
            "[&>div:first-child]:mb-5",
          )}
        >
          <div
            className={cn(
              "[&_h2]:mt-1.5 [&_h2]:text-[17px] [&_h2]:leading-[1.2] [&_h2]:font-[710]",
              "mb-2.75 flex items-end justify-between gap-3",
            )}
          >
            <div>
              <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
                BY EQUIPMENT
              </span>
              <h2>Availability breakdown</h2>
            </div>
          </div>
          {state.equipment.map((e) => (
            <div
              className={cn(
                "grid min-w-0 grid-cols-[minmax(0,1fr)_150px] items-center gap-3.5 border-b border-b-[#e4ebf1] px-0 py-3",
                "[&_strong]:text-[10.5px] [&_strong]:font-[670]",
                "[&_span]:mt-1 [&_span]:block [&_span]:text-[9.5px] [&_span]:text-[#8a9ba8]",
                "last:border-0 max-[480px]:grid-cols-1 [&_strong]:block [&_strong]:wrap-anywhere",
              )}
              key={e.id}
            >
              <div>
                <strong>{e.name}</strong>
                <span>
                  {e.available} of {e.available + e.issued} available
                </span>
              </div>
              <div
                className={cn(
                  "h-1.5 overflow-hidden rounded-[6px] bg-[#e3eaf0]",
                  "[&_i]:block [&_i]:h-full [&_i]:rounded-[6px] [&_i]:bg-[#97aab8]",
                )}
              >
                <i
                  style={{
                    width: `${e.available + e.issued ? (e.available / (e.available + e.issued)) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
        <section
          className={cn(
            "rounded-[10px] border border-line bg-white px-5.75 py-5.75",
            "[&_h2]:mt-2.5 [&_h2]:text-[19px]",
            "[&>p]:mt-2 [&>p]:mb-4.5 [&>p]:text-[10.5px] [&>p]:leading-[1.55] [&>p]:text-[#7e8e9a]",
            "[&>div:first-child]:mb-5",
          )}
        >
          <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
            NEEDS ACTION
          </span>
          <h2>{lowStock.length} low on stock</h2>
          <p>These equipment types have reached their low-stock alert level.</p>
          {lowStock.length ? (
            lowStock.map((e) => (
              <div
                className={cn(
                  "flex justify-between gap-1.5 border-t border-t-line px-0 py-3.25 text-[10.5px]",
                  "[&_strong]:text-[#b47b36]",
                )}
                key={e.id}
              >
                <span>{e.name}</span>
                <strong>{e.available} left</strong>
              </div>
            ))
          ) : (
            <div className="px-0 py-4 text-[11px] text-[#8b9daa]">
              No stock alerts right now.
            </div>
          )}
          <Button onClick={() => navigate("inventory")} variant="secondary" fullWidth>
            Review inventory <Icon name="arrow" size={16} />
          </Button>
        </section>
      </div>
    </>
  );
}
