import { equipmentName, formatDate } from "../../lib/demo-data";
import { sum } from "../../lib/workspace-utils";
import { EmptyState, Metric } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "issued">;

export function IssuesView({ state, issued }: Props) {
  return (
<>
              <div className="metric-grid three">
                <Metric
                  icon="users"
                  label="Currently issued"
                  value={issued}
                  note="Across all equipment"
                />
                <Metric
                  icon="arrows"
                  label="Active issue records"
                  value={
                    state.issues.filter((i) => i.returned < i.quantity).length
                  }
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
              <div className="surface table-surface">
                <div className="table-top">
                  <h2>Custody register</h2>
                  <span>Who currently holds equipment</span>
                </div>
                <div className="table-scroll">
                  <table>
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
                          <td>
                            {equipmentName(state.equipment, i.equipmentId)}
                          </td>
                          <td>{i.assignee}</td>
                          <td>{i.department}</td>
                          <td>
                            <strong>{i.quantity - i.returned}</strong> /{" "}
                            {i.quantity}
                          </td>
                          <td>
                            <span
                              className={`badge ${i.returned === i.quantity ? "badge-green" : "badge-blue"}`}
                            >
                              {i.returned === i.quantity
                                ? "Returned"
                                : "Assigned"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!state.issues.length && <EmptyState title="No equipment assigned yet" message="Receive stock first, then choose Issue equipment to record its custodian and department." />}
                </div>
              </div>
            </>
  );
}
