import { Icon } from "../ui/icons";
import { EquipmentTable, Metric, MovementRow } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "held" | "available" | "issued" | "faulty" | "navigate" | "setDetail">;

export function OverviewView({ state, held, available, issued, faulty, navigate, setDetail }: Props) {
  return (
<>
              <div className="overview-banner">
                <div>
                  <span className="banner-kicker">
                    <span />
                    LIVE STOCK POSITION
                  </span>
                  <h2>Every asset, accounted for.</h2>
                  <p>
                    Keep a steady view of what is ready, who has it, and what
                    needs attention.
                  </p>
                </div>
                <div className="banner-figure">
                  <strong>{held}</strong>
                  <span>
                    units held across
                    <br />
                    {state.equipment.length} equipment types
                  </span>
                  <div className="banner-meter">
                    <i
                      style={{
                        width: `${held ? (available / held) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <small>
                    {Math.round(held ? (available / held) * 100 : 0)}% currently
                    available
                  </small>
                </div>
                <div className="banner-decoration" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="metric-grid">
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
              <div className="section-heading">
                <div>
                  <span className="section-kicker">THE REGISTER</span>
                  <h2>Stock balances</h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate("inventory")}
                >
                  View all inventory <Icon name="arrow" size={16} />
                </button>
              </div>
              <EquipmentTable
                items={state.equipment.slice(0, 4)}
                onSelect={setDetail}
              />
              <div className="overview-lower">
                <section className="surface activity-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">LATEST ACTIVITY</span>
                      <h2>Recent movements</h2>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => navigate("movements")}
                    >
                      View history <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <div className="activity-list">
                    {state.movements.slice(0, 4).map((m) => (
                      <MovementRow
                        key={m.id}
                        movement={m}
                        equipment={state.equipment}
                      />
                    ))}
                  </div>
                </section>
                <section className="attention-panel">
                  <div className="attention-top">
                    <span className="attention-icon">
                      <Icon name="tool" size={20} />
                    </span>
                    <span>MAINTENANCE WATCH</span>
                  </div>
                  <strong>{faulty} units need attention</strong>
                  <p>
                    Faults stay linked to their location and custodian while
                    repairs are in progress.
                  </p>
                  <div className="attention-bottom">
                    <div className="mini-avatars">
                      <span>AO</span>
                      <span>CO</span>
                      <span>FT</span>
                    </div>
                    <button
                      className="text-link"
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

