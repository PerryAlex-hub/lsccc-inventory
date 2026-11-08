import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Icon } from "../ui/icons";
import { EquipmentTable, Metric, MovementRow } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<
  WorkspaceViewProps,
  | "state"
  | "held"
  | "available"
  | "issued"
  | "faulty"
  | "navigate"
  | "setDetail"
  | "setForm"
>;

export function OverviewView({
  state,
  held,
  available,
  issued,
  faulty,
  navigate,
  setDetail,
  setForm,
}: Props) {
  return (
    <>
      {!state.equipment.length && (
        <div
          className={cn(
            "mx-0 mt-0 mb-5 rounded-[8px] border border-[#dbe4eb] bg-[#f0f5f8] px-4 py-4 text-[12px] leading-[1.6]",
            "[&_p]:mb-2 [&_p]:text-[#526573]",
            "[&>button]:mt-1.5",
          )}
        >
          <strong>Start with your first delivery</strong>
          <p>
            Choose Receive stock to register equipment and record how many units arrived.
            You can then issue it to staff and track any repairs.
          </p>
          <Button onClick={() => setForm("receive")} variant="secondary">
            Receive your first stock <Icon name="arrow" size={16} />
          </Button>
        </div>
      )}
      <div
        className={cn(
          "relative flex min-h-42 items-center justify-between gap-6.25 rounded-[12px] bg-[#263b47] text-white",
          "isolate overflow-hidden px-7.75 py-6.25",
          "[&_h2]:mt-3 [&_h2]:text-[23px] [&_h2]:leading-[1.2] [&_h2]:font-[690] [&_h2]:tracking-[-.045em]",
          "[&_p]:mt-2 [&_p]:max-w-120 [&_p]:text-[11.5px] [&_p]:leading-[1.6] [&_p]:text-[#c8cfd4]",
          "max-md:min-h-55 max-md:flex-col max-md:items-start max-md:gap-5 max-md:px-5.5",
          "max-md:py-5.5",
          "max-md:[&_h2]:text-[21px]",
        )}
      >
        <div>
          <span className="text-[9px] font-[720] tracking-[.17em] text-[#cbd2d7]">
            CURRENT STOCK POSITION
          </span>
          <h2>Every asset, accounted for.</h2>
          <p>
            Keep a steady view of what is ready, who has it, and what needs attention.
          </p>
        </div>
        <div
          className={cn(
            "w-53.75 flex-none pr-0.5",
            "[&_strong]:text-[39px] [&_strong]:leading-[1] [&_strong]:font-[680] [&_strong]:tracking-[-.07em]",
            "[&>span]:ml-3 [&>span]:inline-block [&>span]:text-[10px] [&>span]:leading-[1.45] [&>span]:text-[#ccd3d8]",
            "[&_small]:mt-1.75 [&_small]:block [&_small]:text-[9px] [&_small]:text-[#c6cdd2]",
            "max-md:grid max-md:w-full max-md:grid-cols-[auto_1fr] max-md:gap-x-2.5",
            "max-md:[&>span]:ml-0 max-md:[&>span]:self-center",
            "max-md:[&_small]:col-span-full",
          )}
        >
          <strong>{held}</strong>
          <span>
            units held across
            <br />
            {state.equipment.length} equipment types
          </span>
          <div
            className={cn(
              "mt-3.75 h-1.25 overflow-hidden rounded-[5px] bg-[#58636b]",
              "[&_i]:block [&_i]:h-full [&_i]:rounded-[5px] [&_i]:bg-[#cbd2d7]",
              "max-md:col-span-full",
            )}
          >
            <i
              style={{
                width: `${held ? (available / held) * 100 : 0}%`,
              }}
            />
          </div>
          <small>
            {Math.round(held ? (available / held) * 100 : 0)}% currently available
          </small>
        </div>
      </div>
      <div
        className={cn(
          "mx-0 mt-4.5 mb-8.75 grid grid-cols-4 gap-3.5",
          "max-md:mx-0 max-md:mt-3.25 max-md:mb-7 max-md:grid-cols-2 max-md:gap-2.25",
          "max-[391px]:grid-cols-[1fr_1fr]",
        )}
      >
        <Metric
          icon="box"
          label="Total equipment held"
          value={held}
          note={`Across ${state.equipment.length} equipment types`}
        />
        <Metric
          icon="check"
          label="Available in store"
          value={available}
          note="Ready to be issued"
          tone="green"
        />
        <Metric
          icon="users"
          label="Currently issued"
          value={issued}
          note="With staff and departments"
        />
        <Metric
          icon="tool"
          label="Under maintenance"
          value={faulty}
          note="Included in custody totals"
          tone="amber"
        />
      </div>
      <div
        className={cn(
          "mx-0 mt-0 mb-3.75 flex items-end justify-between",
          "[&_h2]:mt-1.5 [&_h2]:text-[17px] [&_h2]:leading-[1.2] [&_h2]:font-[710]",
          "max-md:[&_h2]:text-[16px]",
        )}
      >
        <div>
          <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
            THE REGISTER
          </span>
          <h2>Stock balances</h2>
        </div>
        <button
          className={cn(
            "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
            "px-0 py-0.5 whitespace-nowrap",
            "hover:text-[#37444d] hover:underline hover:underline-offset-4",
          )}
          onClick={() => navigate("inventory")}
        >
          View all inventory <Icon name="arrow" size={16} />
        </button>
      </div>
      <EquipmentTable
        items={state.equipment.filter((item) => !item.archivedAt).slice(0, 4)}
        onSelect={setDetail}
      />
      <div
        className={cn(
          "mt-5.5 grid grid-cols-[minmax(0,1.45fr)_minmax(280px,1fr)] gap-4.25",
          "max-md:grid-cols-[1fr]",
        )}
      >
        <section className="rounded-[10px] border border-line bg-white px-5.5 pt-5.25 pb-2.5">
          <div
            className={cn(
              "[&_h2]:mt-1.5 [&_h2]:text-[17px] [&_h2]:leading-[1.2] [&_h2]:font-[710]",
              "mb-2.75 flex items-end justify-between gap-3",
            )}
          >
            <div>
              <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
                LATEST ACTIVITY
              </span>
              <h2>Recent activity</h2>
            </div>
            <button
              className={cn(
                "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
                "px-0 py-0.5 whitespace-nowrap",
                "hover:text-[#37444d] hover:underline hover:underline-offset-4",
              )}
              onClick={() => navigate("movements")}
            >
              View history <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="[&>div:last-child]:border-b-0">
            {[...state.movements]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 4)
              .map((m) => (
                <MovementRow key={m.id} movement={m} equipment={state.equipment} />
              ))}
          </div>
        </section>
        <section
          className={cn(
            "flex min-h-68.75 flex-col rounded-[10px] border border-[#dee6eb] bg-[#e6edf3] px-6.25 py-5.75",
            "[&>strong]:mt-5.75 [&>strong]:text-[23px] [&>strong]:font-bold [&>strong]:tracking-[-.05em]",
            "[&>strong]:leading-[1.15]",
            "[&>p]:mt-2.5 [&>p]:max-w-75 [&>p]:text-[11.5px] [&>p]:leading-[1.6] [&>p]:text-[#6a7781]",
            "max-md:min-h-58.75",
          )}
        >
          <div className="flex items-center gap-2.5 text-[9px] font-[780] tracking-[.12em] text-[#6b7882]">
            <span className="grid h-7.25 w-7.25 place-items-center rounded-[7px] bg-[#e5ebee] text-[#405b6a]">
              <Icon name="tool" size={20} />
            </span>
            <span>MAINTENANCE WATCH</span>
          </div>
          <strong>{faulty} units need attention</strong>
          <p>
            Faults stay linked to their location and custodian while repairs are in
            progress.
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-5.25">
            <button
              className={cn(
                "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
                "px-0 py-0.5 whitespace-nowrap",
                "hover:text-[#37444d] hover:underline hover:underline-offset-4",
              )}
              onClick={() => navigate("maintenance")}
            >
              Open repair register <Icon name="arrow" size={16} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
