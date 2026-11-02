import { equipmentName, formatDate, type Equipment, type Movement } from "../../lib/demo-data";
import { Icon, categoryIcon, type IconName } from "./icons";

export function Metric({
  icon,
  label,
  value,
  note,
  tone = "neutral",
}: {
  icon: IconName;
  label: string;
  value: number;
  note: string;
  tone?: "neutral" | "green" | "amber";
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}>
          <Icon name={icon} size={19} />
        </span>
      </div>
      <strong>{value.toLocaleString("en-NG")}</strong>
      <small>{note}</small>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <span>
        <Icon name="box" size={25} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function EquipmentTable({
  items,
  onSelect,
  empty = false,
}: {
  items: Equipment[];
  onSelect: (id: string) => void;
  empty?: boolean;
}) {
  return (
    <div className="surface table-surface inventory-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Category</th>
              <th>Total held</th>
              <th>Available</th>
              <th>Issued</th>
              <th>Faulty</th>
              <th aria-label="Details" />
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr
                key={e.id}
                onClick={() => onSelect(e.id)}
                className="clickable-row"
              >
                <td>
                  <div className="equipment-cell">
                    <span className="equipment-icon">
                      <Icon name={categoryIcon(e.category)} size={21} />
                    </span>
                    <span>
                      <strong>{e.name}</strong>
                      <small>{e.id}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="category-tag">{e.category}</span>
                </td>
                <td className="numeric">{e.available + e.issued}</td>
                <td className="numeric">
                  <span
                    className={e.available <= e.reorder ? "low-number" : ""}
                  >
                    {e.available}
                  </span>
                </td>
                <td className="numeric">{e.issued}</td>
                <td className="numeric">
                  {e.faulty > 0 ? (
                    <span className="fault-number">{e.faulty}</span>
                  ) : (
                    "â€”"
                  )}
                </td>
                <td>
                  <button
                    className="row-arrow"
                    aria-label={`View ${e.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(e.id);
                    }}
                  >
                    <Icon name="chevron" size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {empty && (
          <EmptyState
            title="No equipment found"
            message="Try another search or clear the filters to see all equipment."
          />
        )}
      </div>
    </div>
  );
}

export function MovementRow({
  movement,
  equipment,
  expanded = false,
}: {
  movement: Movement;
  equipment: Equipment[];
  expanded?: boolean;
}) {
  const icon: IconName =
    movement.type === "Receipt"
      ? "inbox"
      : movement.type === "Fault"
        ? "tool"
        : movement.type === "Repair"
          ? "check"
          : "arrows";
  return (
    <div className={`movement-row ${expanded ? "expanded" : ""}`}>
      <span className={`movement-icon type-${movement.type.toLowerCase()}`}>
        <Icon name={icon} size={18} />
      </span>
      <div className="movement-copy">
        <strong>
          {movement.type}{" "}
          <span>Â· {equipmentName(equipment, movement.equipmentId)}</span>
        </strong>
        <p>{movement.description}</p>
        {expanded && (
          <small>
            {movement.id} Â· Recorded by {movement.actor}
          </small>
        )}
      </div>
      <time dateTime={movement.date}>{formatDate(movement.date)}</time>
    </div>
  );
}

