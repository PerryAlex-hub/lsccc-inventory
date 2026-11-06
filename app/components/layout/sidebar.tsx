import Image from "next/image";
import type { View } from "../../lib/workspace-config";
import { Icon, type IconName } from "../ui/icons";

const nav: { label: string; view: View; icon: IconName }[] = [
  { label: "Overview", view: "overview", icon: "grid" },
  { label: "Inventory", view: "inventory", icon: "box" },
  { label: "Receipts", view: "receipts", icon: "inbox" },
  { label: "Equipment issues", view: "issues", icon: "arrows" },
  { label: "Maintenance", view: "maintenance", icon: "tool" },
  { label: "Activity history", view: "movements", icon: "history" },
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
          <Image className="brand-logo" src="/lsccc-logo.jpg" alt="Lagos State Command and Control Centre crest" width={42} height={42} priority />
          <div>
            <strong>LSCCC</strong>
            <small>Inventory workspace</small>
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

