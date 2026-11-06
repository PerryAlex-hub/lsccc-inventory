import { equipmentName } from "../../lib/demo-data";
import { formatDateTime, sum } from "../../lib/workspace-utils";
import { EmptyState } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state">;

export function ReceiptsView({ state }: Props) {
  return (
<>
              <div className="inline-summary">
                <span>
                  <strong>{state.receipts.length}</strong> recorded deliveries
                </span>
                <span className="separator" />
                <span>
                  <strong>{sum(state.receipts.map((r) => r.quantity))}</strong>{" "}
                  units received
                </span>
              </div>
              <div className="surface table-surface">
                <div className="table-top">
                  <h2>Delivery register</h2>
                  <span>Latest first</span>
                </div>
                <div className="table-scroll">
                  <table>
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
                      {[...state.receipts].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.id}</strong>
                          </td>
                          <td>
                            {equipmentName(state.equipment, r.equipmentId)}
                          </td>
                          <td>{r.supplier}</td>
                          <td>
                            <strong>{r.quantity}</strong> units
                          </td>
                          <td><time dateTime={r.date}>{formatDateTime(r.date)}</time></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!state.receipts.length && <EmptyState title="No deliveries received yet" message="Choose Receive stock to register equipment and record its first delivery." />}
                </div>
              </div>
            </>
  );
}
