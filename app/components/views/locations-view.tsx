import { Icon } from "../ui/icons";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "available">;

export function LocationsView({ state, available }: Props) {
  return (
<>
              <div className="inline-summary">
                <span>
                  <strong>{state.locations.length}</strong> registered locations
                </span>
                <span className="separator" />
                <span>One shared view of stores and departments</span>
              </div>
              <div className="location-grid">
                {state.locations.map((l) => (
                  <article className="location-card" key={l.id}>
                    <div className="location-icon">
                      <Icon
                        name={l.kind === "Store" ? "box" : "pin"}
                        size={23}
                      />
                    </div>
                    <span className="location-kind">
                      {l.kind.toUpperCase()} Â· {l.id}
                    </span>
                    <h2>{l.name}</h2>
                    <p>Responsible: {l.lead}</p>
                    <div className="location-foot">
                      <span>
                        {l.name === "Equipment store"
                          ? `${available} units available`
                          : l.name === "Operations"
                            ? "Operations custody"
                            : l.name === "Administration"
                              ? "Administrative custody"
                              : "Facility operations"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </>
  );
}

