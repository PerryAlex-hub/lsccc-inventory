import { cn } from "@/app/lib/cn";
import { Table } from "@/app/components/ui/table";
import { equipmentName } from "../../lib/demo-data";
import { formatDateTime, sum } from "../../lib/workspace-utils";
import { EmptyState } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state">;

export function ReceiptsView({ state }: Props) {
  return (
    <>
      <div
        className={cn(
          "mx-0 -mt-1 mb-5.5 flex items-center gap-4.25 text-[11.5px] text-[#768590]",
          "[&_strong]:text-[13px] [&_strong]:text-[#303a42]",
          "max-[681px]:flex-wrap max-[681px]:gap-[8px_12px]",
        )}
      >
        <span>
          <strong>{state.receipts.length}</strong> recorded deliveries
        </span>
        <span className="h-4 w-px bg-[#d3dadf]" />
        <span>
          <strong>{sum(state.receipts.map((r) => r.quantity))}</strong> units received
        </span>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        <div
          className={cn(
            "[&_h2]:mx-0 [&_h2]:my-0 [&_h2]:text-[17px] [&_h2]:leading-[1.2] [&_h2]:font-[710]",
            "flex min-h-17 items-center justify-between gap-3 px-4.75 pt-4.75 pb-3.5",
            "[&>span]:text-[10px] [&>span]:text-[#8d9fac]",
          )}
        >
          <h2>Delivery register</h2>
          <span>Latest first</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Equipment</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Received (Lagos time)</th>
              </tr>
            </thead>
            <tbody>
              {[...state.receipts]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.id}</strong>
                    </td>
                    <td>{equipmentName(state.equipment, r.equipmentId)}</td>
                    <td>{r.supplier}</td>
                    <td>
                      <strong>{r.quantity}</strong> units
                    </td>
                    <td>
                      <time dateTime={r.date}>{formatDateTime(r.date)}</time>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          {!state.receipts.length && (
            <EmptyState
              title="No deliveries received yet"
              message="Choose Receive stock to register equipment and record its first delivery."
            />
          )}
        </div>
      </div>
    </>
  );
}
