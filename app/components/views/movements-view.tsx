import { cn } from "@/app/lib/cn";
import { MovementRow } from "../ui/inventory-widgets";
import { RecordActions } from "../ui/record-actions";
import { equipmentName } from "../../lib/demo-data";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "onRecordAction">;

export function MovementsView({ state, onRecordAction }: Props) {
  return (
    <>
      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        <div
          className={cn(
            "[&_h2]:mx-0 [&_h2]:my-0 [&_h2]:text-[17px] [&_h2]:leading-[1.2] [&_h2]:font-[710]",
            "flex min-h-17 items-center justify-between gap-3 px-4.75 pt-4.75 pb-3.5",
            "[&>span]:text-[10px] [&>span]:text-[#8d9fac]",
          )}
        >
          <h2>Activity history</h2>
          <span>{state.movements.length} entries</span>
        </div>
        <div className="px-6 pt-0 pb-3">
          {[...state.movements]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((m) => (
              <div key={m.id} className="border-b border-line pb-2 last:border-0">
                <MovementRow movement={m} equipment={state.equipment} expanded />
                <RecordActions
                  target={{
                    collection: "movements",
                    id: m.id,
                    label: `${m.type} · ${equipmentName(state.equipment, m.equipmentId)}`,
                  }}
                  archived={Boolean(m.archivedAt)}
                  onAction={onRecordAction}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
