import { equipmentName, formatDate } from "../../lib/demo-data";
import { sum } from "../../lib/workspace-utils";
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
                        <th>Reference</th>
                        <th>Equipment</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Date received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.receipts.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.id}</strong>
                            <small>{r.reference}</small>
                          </td>
                          <td>
                            {equipmentName(state.equipment, r.equipmentId)}
                          </td>
                          <td>{r.supplier}</td>
                          <td>
                            <strong>{r.quantity}</strong> units
                          </td>
                          <td>{formatDate(r.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
  );
}
