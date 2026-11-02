import type { View } from "../../lib/workspace-config";
import { Icon, type IconName } from "../ui/icons";

const nav: { label: string; view: View; icon: IconName }[] = [
  { label: "Overview", view: "overview", icon: "grid" },
  { label: "Inventory", view: "inventory", icon: "box" },
  { label: "Receipts", view: "receipts", icon: "inbox" },
  { label: "Issues & returns", view: "issues", icon: "arrows" },
  { label: "Maintenance", view: "maintenance", icon: "tool" },
  { label: "Locations", view: "locations", icon: "pin" },
  { label: "Stock movements", view: "movements", icon: "history" },
  { label: "Reports", view: "reports", icon: "chart" },
];

type Props = {
  view: View;
  mobileNav: boolean;
  setMobileNav: (open: boolean) => void;
  navigate: (view: View) => void;
  openFaultCount: number;
};

export function Sidebar({ view, mobileNav, setMobileNav, navigate, openFaultCount }: Props) {
  return (
    <>
      <aside
        className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>LSCCC</strong>
            <small>INVENTORY WORKSPACE</small>
          </div>
        </div>
        <div className="side-section-label">WORKSPACE</div>
        <nav className="side-nav">
          {nav.map((entry) => (
            <button
              key={entry.view}
              className={`nav-item ${view === entry.view ? "active" : ""}`}
              onClick={() => navigate(entry.view)}
            >
              <Icon name={entry.icon} size={18} />
              <span>{entry.label}</span>
              {entry.view === "maintenance" && openFaultCount > 0 && (
                <em>{openFaultCount}</em>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-section-label">PREFERENCES</div>
          <button
            className={`nav-item ${view === "settings" ? "active" : ""}`}
            onClick={() => navigate("settings")}
          >
            <Icon name="settings" size={18} />
            <span>Settings</span>
          </button>
          <div className="user-card">
            <div className="avatar">AO</div>
            <div>
              <strong>Admin Officer</strong>
              <small>Inventory administrator</small>
            </div>
            <Icon name="more" size={18} />
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
    </>
  );
}

