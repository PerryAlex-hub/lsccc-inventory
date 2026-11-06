import { Icon } from "../ui/icons";
import { formatDate } from "../../lib/demo-data";
import { today } from "../../lib/workspace-utils";
import { Metric } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "held" | "available" | "issued" | "faulty" | "openFaults" | "lowStock" | "navigate">;

export function ReportsView({ state, held, available, issued, faulty, openFaults, lowStock, navigate }: Props) {
  return (
<>
              <div className="report-intro">
                <div>
                  <span className="section-kicker">OPERATIONS SNAPSHOT</span>
                  <h2>Stock health at a glance</h2>
                  <p>
                    Use these live totals for daily handovers and monthly
                    reporting.
                  </p>
                </div>
                <div className="report-date">
                  <Icon name="clock" size={17} />
                  {formatDate(today(), true)}
                </div>
              </div>
              <div className="metric-grid">
                <Metric
                  icon="box"
                  label="Total held"
                  value={held}
                  note="All equipment types"
                />
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
              <div className="report-grid">
                <section className="surface report-block">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">BY EQUIPMENT</span>
                      <h2>Availability breakdown</h2>
                    </div>
                  </div>
                  {state.equipment.map((e) => (
                    <div className="report-bar-row" key={e.id}>
                      <div>
                        <strong>{e.name}</strong>
                        <span>
                          {e.available} of {e.available + e.issued} available
                        </span>
                      </div>
                      <div className="bar-track">
                        <i
                          style={{
                            width: `${e.available + e.issued ? (e.available / (e.available + e.issued)) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </section>
                <section className="surface report-block report-aside">
                  <span className="section-kicker">NEEDS ACTION</span>
                  <h2>{lowStock.length} low on stock</h2>
                  <p>
                    These equipment types have reached their low-stock alert level.
                  </p>
                  {lowStock.length ? (
                    lowStock.map((e) => (
                      <div className="reorder-row" key={e.id}>
                        <span>{e.name}</span>
                        <strong>{e.available} left</strong>
                      </div>
                    ))
                  ) : (
                    <div className="empty-inline">
                      No stock alerts right now.
                    </div>
                  )}
                  <button
                    className="button secondary full-width"
                    onClick={() => navigate("inventory")}
                  >
                    Review inventory <Icon name="arrow" size={16} />
                  </button>
                </section>
              </div>
            </>
  );
}

