import type { Equipment, Movement } from "../../lib/demo-data";
import { Icon, categoryIcon } from "../ui/icons";
import { MovementRow } from "../ui/inventory-widgets";

export function DetailPanel({
  item,
  movements,
  onClose,
  onEdit,
  onIssue,
  onReceive,
}: {
  item: Equipment;
  movements: Movement[];
  onClose: () => void;
  onEdit: () => void;
  onIssue: () => void;
  onReceive: () => void;
}) {
  return (
    <div className="drawer-layer">
      <button
        className="drawer-scrim"
        aria-label="Close equipment details"
        onClick={onClose}
      />
      <aside className="drawer" aria-label={`${item.name} details`}>
        <div className="drawer-head">
          <span>Equipment details</span>
          <button
            className="icon-button"
            aria-label="Close equipment details"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="detail-hero">
            <span className="detail-icon">
              <Icon name={categoryIcon(item.category)} size={32} />
            </span>
            <span className="section-kicker">
              {item.id} Â· {item.category}
            </span>
            <h2>{item.name}</h2>
            <p>Tracked across store and staff custody.</p>
            <button className="text-link detail-edit" onClick={onEdit}>
              Edit equipment <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="detail-numbers">
            <div>
              <span>Total held</span>
              <strong>{item.available + item.issued}</strong>
            </div>
            <div>
              <span>Available</span>
              <strong>{item.available}</strong>
            </div>
            <div>
              <span>Issued</span>
              <strong>{item.issued}</strong>
            </div>
            <div>
              <span>Faulty</span>
              <strong>{item.faulty}</strong>
            </div>
          </div>
          <div className="drawer-section">
            <h3>Stock position</h3>
            <div className="stock-track">
              <i
                style={{
                  width: `${item.available + item.issued ? (item.available / (item.available + item.issued)) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="stock-legend">
              <span>
                <i />
                Available
              </span>
              <span>
                <i />
                Issued
              </span>
            </div>
          </div>
          <div className="drawer-section">
            <h3>Details</h3>
            <div className="detail-line">
              <span>Primary store</span>
              <strong>{item.location}</strong>
            </div>
            <div className="detail-line">
              <span>Low-stock alert at</span>
              <strong>{item.reorder} units</strong>
            </div>
            <div className="detail-line">
              <span>Stock status</span>
              <span
                className={`badge ${item.available <= item.reorder ? "badge-amber" : "badge-green"}`}
              >
                {item.available <= item.reorder ? "Low stock" : "Healthy"}
              </span>
            </div>
          </div>
          <div className="drawer-section">
            <h3>Recent activity</h3>
            {movements.length ? (
              movements
                .slice(0, 3)
                .map((m) => (
                  <MovementRow key={m.id} movement={m} equipment={[item]} />
                ))
            ) : (
              <p className="muted">No movements recorded yet.</p>
            )}
          </div>
        </div>
        <div className="drawer-actions">
          <button className="button secondary" onClick={onReceive}>
            Receive stock
          </button>
          <button className="button primary" onClick={onIssue}>
            Issue equipment
          </button>
        </div>
      </aside>
    </div>
  );
}

