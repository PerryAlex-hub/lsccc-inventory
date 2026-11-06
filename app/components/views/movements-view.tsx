import { MovementRow } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state">;

export function MovementsView({ state }: Props) {
  return (
<>
              <div className="surface movements-surface">
                <div className="table-top">
                  <h2>Activity history</h2>
                  <span>{state.movements.length} entries</span>
                </div>
                <div className="movement-timeline">
                  {[...state.movements].sort((a, b) => b.date.localeCompare(a.date)).map((m) => (
                    <MovementRow
                      key={m.id}
                      movement={m}
                      equipment={state.equipment}
                      expanded
                    />
                  ))}
                </div>
              </div>
            </>
  );
}
