import { cn } from "@/app/lib/cn";
import { Table } from "@/app/components/ui/table";
import { equipmentName, formatDate } from "../../lib/demo-data";
import { sum } from "../../lib/workspace-utils";
import { EmptyState, Metric } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "issued">;

export function IssuesView({ state, issued }: Props) {
  return (
    <>
      <div
        className={cn(
          "mx-0 mt-0 mb-8.75 grid grid-cols-3 gap-3.5",
          "max-[681px]:mx-0 max-[681px]:mt-3.25 max-[681px]:mb-7 max-[681px]:grid-cols-2 max-[681px]:gap-2.25",
          "max-[391px]:grid-cols-[1fr_1fr]",
        )}
      >
        <Metric
          icon="users"
          label="Currently issued"
          value={issued}
          note="Across all equipment"
        />
        <Metric
          icon="arrows"
          label="Active issue records"
          value={state.issues.filter((i) => i.returned < i.quantity).length}
          note="Equipment held by staff"
        />
        <Metric
          icon="check"
          label="Units returned"
          value={sum(state.issues.map((i) => i.returned))}
          note="From earlier return records"
          tone="green"
        />
      </div>
      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        <div
          className={cn(
            "[&_h2]:mx-0 [&_h2]:my-0 [&_h2]:text-[17px] [&_h2]:leading-[1.2] [&_h2]:font-[710]",
            "flex min-h-17 items-center justify-between gap-3 px-4.75 pt-4.75 pb-3.5",
            "[&>span]:text-[10px] [&>span]:text-[#8d9fac]",
          )}
        >
          <h2>Custody register</h2>
          <span>Who currently holds equipment</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Equipment</th>
                <th>Custodian</th>
                <th>Department</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {state.issues.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.id}</strong>
                    <small>{formatDate(i.date)}</small>
                  </td>
                  <td>{equipmentName(state.equipment, i.equipmentId)}</td>
                  <td>{i.assignee}</td>
                  <td>{i.department}</td>
                  <td>
                    <strong>{i.quantity - i.returned}</strong> / {i.quantity}
                  </td>
                  <td>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-[3px] px-2 py-1.25 text-[9.5px] font-bold whitespace-nowrap",
                        i.returned === i.quantity
                          ? "bg-[#edf3ef] text-[#3f725b]"
                          : "bg-[#edf2fb] text-[#5575a8]",
                      )}
                    >
                      {i.returned === i.quantity ? "Returned" : "Assigned"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {!state.issues.length && (
            <EmptyState
              title="No equipment assigned yet"
              message="Receive stock first, then choose Issue equipment to record its custodian and department."
            />
          )}
        </div>
      </div>
    </>
  );
}
