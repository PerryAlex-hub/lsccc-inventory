import type { RefObject } from "react";
import type { View } from "../../lib/workspace-config";
import { headings } from "../../lib/workspace-config";
import { Icon } from "../ui/icons";

type Props = {
  view: View;
  setView: (view: View) => void;
  navigate: (view: View) => void;
  query: string;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  setMobileNav: (open: boolean) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  notifications: boolean;
  setNotifications: (open: boolean) => void;
  faulty: number;
  lowStockCount: number;
};

export function Topbar({ view, setView, navigate, query, setQuery, setPage, setMobileNav, searchRef, notifications, setNotifications, faulty, lowStockCount }: Props) {
  return (
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <Icon name="chevron" size={14} />
            <strong>{headings[view].title}</strong>
          </div>
          <div className="top-search">
            <Icon name="search" size={18} />
            <input
              ref={searchRef}
              aria-label="Search equipment"
              placeholder="Search equipment..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                if (event.target.value && view !== "inventory") {
                  setView("inventory");
                  window.history.pushState(null, "", "#inventory");
                }
              }}
            />
            <kbd>Ctrl K</kbd>
          </div>
          <div className="top-actions">
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              aria-expanded={notifications}
              onClick={() => setNotifications(!notifications)}
            >
              <Icon name="bell" size={19} />
            </button>
            <div className="top-avatar">AO</div>
          </div>
          {notifications && (
            <div className="notification-popover">
              <div className="popover-heading">
                <strong>Notifications</strong>
                <button
                  className="icon-button"
                  aria-label="Close notifications"
                  onClick={() => setNotifications(false)}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
              <p>
                <Icon name="alert" size={17} />
                {faulty} units need maintenance attention.
              </p>
              <p>
                <Icon name="box" size={17} />
                {lowStockCount} equipment types are low on stock.
              </p>
              <button
                className="text-link"
                onClick={() => {
                  setNotifications(false);
                  navigate("maintenance");
                }}
              >
                View maintenance <Icon name="arrow" size={15} />
              </button>
            </div>
          )}
        </header>
  );
}

