import { Icon } from "../ui/icons";
import { equipmentName } from "../../lib/demo-data";
import { categoryIcon } from "../ui/icons";
import { EmptyState, Metric } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "faulty" | "openFaults" | "updateFault">;

export function MaintenanceView({ state, faulty, openFaults, updateFault }: Props) {
  return (
<>
              <div className="metric-grid three">
                <Metric
                  icon="alert"
                  label="Units needing attention"
                  value={faulty}
                  note="Across active fault reports"
                  tone="amber"
                />
                <Metric
                  icon="clock"
                  label="Open reports"
                  value={openFaults.length}
                  note="Reported or in progress"
                />
                <Metric
                  icon="check"
                  label="Resolved reports"
                  value={state.faults.length - openFaults.length}
                  note="Completed repairs"
                  tone="green"
                />
              </div>
              <div className="section-heading">
                <div>
                  <span className="section-kicker">REPAIR REGISTER</span>
                  <h2>Active cases</h2>
                </div>
              </div>
              <div className="fault-grid">
                {state.faults
                  .filter((f) => f.status !== "Resolved")
                  .map((f) => (
                    <article className="fault-card" key={f.id}>
                      <div className="fault-card-top">
                        <span
                          className={`priority priority-${f.priority.toLowerCase()}`}
                        >
                          {f.priority} priority
                        </span>
                        <span className="muted">{f.id}</span>
                      </div>
                      <div className="fault-icon">
                        <Icon
                          name={categoryIcon(
                            state.equipment.find((e) => e.id === f.equipmentId)
                              ?.category || "",
                          )}
                          size={25}
                        />
                      </div>
                      <h3>{f.title}</h3>
                      <p>
                        {equipmentName(state.equipment, f.equipmentId)} Â·{" "}
                        {f.quantity} {f.quantity === 1 ? "unit" : "units"}
                      </p>
                      <div className="fault-meta">
                        <span>
                          <Icon name="pin" size={15} />
                          {f.location}
                        </span>
                        <span>
                          <Icon name="users" size={15} />
                          {f.custodian}
                        </span>
                      </div>
                      <div className="fault-card-footer">
                        <span
                          className={`badge ${f.status === "In progress" ? "badge-blue" : "badge-amber"}`}
                        >
                          {f.status}
                        </span>
                        {f.status === "Reported" ? (
                          <button
                            className="text-link"
                            onClick={() => updateFault(f, "In progress")}
                          >
                            Start repair <Icon name="arrow" size={15} />
                          </button>
                        ) : (
                          <button
                            className="text-link"
                            onClick={() => updateFault(f, "Resolved")}
                          >
                            Complete repair <Icon name="check" size={15} />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                {openFaults.length === 0 && (
                  <EmptyState
                    title="All repairs are complete"
                    message="New fault reports will appear here."
                  />
                )}
              </div>
            </>
  );
}

