import { Icon } from "../ui/icons";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "resetData">;

export function SettingsView({ resetData }: Props) {
  return (
<div className="settings-grid">
              <section className="surface settings-card">
                <div className="settings-symbol">
                  <Icon name="grid" size={23} />
                </div>
                <h2>Workspace details</h2>
                <p>
                  This frontend currently stores changes in this browser. It is
                  ready for a backend connection.
                </p>
                <div className="settings-row">
                  <span>Workspace</span>
                  <strong>LSCCC Inventory</strong>
                </div>
                <div className="settings-row">
                  <span>Account role</span>
                  <strong>Inventory administrator</strong>
                </div>
                <div className="settings-row">
                  <span>Data mode</span>
                  <span className="badge badge-green">Local demo</span>
                </div>
              </section>
              <section className="surface settings-card">
                <div className="settings-symbol amber">
                  <Icon name="history" size={23} />
                </div>
                <h2>Demo data</h2>
                <p>
                  Restore the sample inventory, movements and repair records
                  from the reference design.
                </p>
                <button
                  className="button secondary"
                  onClick={() => {
                    resetData();
                  }}
                >
                  Restore sample data
                </button>
              </section>
            </div>
  );
}

