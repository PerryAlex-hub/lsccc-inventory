import { cn } from "@/app/lib/cn";
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

export function Topbar({
  view,
  setView,
  navigate,
  query,
  setQuery,
  setPage,
  setMobileNav,
  searchRef,
  notifications,
  setNotifications,
  faulty,
  lowStockCount,
}: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-18 items-center gap-7.5 border-b border-b-line bg-white px-8.25 py-0",
        "max-[1181px]:gap-4.5 max-[1181px]:px-6 max-[1181px]:py-0",
        "max-[681px]:h-15.5 max-[681px]:gap-2.5 max-[681px]:px-4 max-[681px]:py-0",
      )}
    >
      <button
        className={cn(
          "hidden h-8.25 w-8.25 place-items-center rounded-[7px] border-0 bg-transparent text-[#697680]",
          "max-[921px]:grid",
          "hover:bg-[#e8eff5] hover:text-primary",
        )}
        aria-label="Open navigation"
        onClick={() => setMobileNav(true)}
      >
        <Icon name="menu" />
      </button>
      <div
        className={cn(
          "flex items-center gap-2.5 text-[12px] whitespace-nowrap text-[#8394a0]",
          "[&_strong]:font-[650] [&_strong]:text-[#545e66]",
          "[&_svg]:text-[#99acba]",
          "max-[921px]:hidden",
        )}
      >
        <span>Workspace</span>
        <Icon name="chevron" size={14} />
        <strong>{headings[view].title}</strong>
      </div>
      <div
        className={cn(
          "ml-auto flex h-9.75 max-w-97.5 min-w-37.5 flex-1 rounded-[8px] border border-[#eff2ef] bg-[#f6f8f6]",
          "items-center gap-2.25 px-2.75 py-0 text-[#8b9ca9]",
          "[&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none",
          "[&_input]:text-[11.5px] [&_input]:text-ink",
          "[&_kbd]:rounded-[4px] [&_kbd]:border [&_kbd]:border-[#dae2e7] [&_kbd]:font-mono [&_kbd]:text-[9px]",
          "[&_kbd]:px-1.25 [&_kbd]:py-0.75 [&_kbd]:whitespace-nowrap [&_kbd]:text-[#8b9ca9]",
          "max-[921px]:max-w-[none]",
          "max-[681px]:h-8.75",
          "max-[681px]:[&_kbd]:hidden",
          "focus-within:border-[#95a8b6] focus-within:bg-white",
          "[&_input::placeholder]:text-[#8b9daa]",
        )}
      >
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
      <div className={cn("flex items-center gap-3.75", "max-[681px]:gap-0.75")}>
        <button
          className={cn(
            "relative grid h-8.25 w-8.25 place-items-center rounded-[7px] border-0 bg-transparent text-[#697680]",
            "hover:bg-[#e8eff5] hover:text-primary",
          )}
          aria-label="Notifications"
          aria-expanded={notifications}
          onClick={() => setNotifications(!notifications)}
        >
          <Icon name="bell" size={19} />
        </button>
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-[7px] bg-[#e9edf0] text-[11px] font-[780] text-[#334a58]",
            "max-[681px]:hidden",
          )}
        >
          AO
        </div>
      </div>
      {notifications && (
        <div
          className={cn(
            "absolute top-15.75 right-13.5 w-80 rounded-[12px] border border-line bg-white shadow-[0_22px_60px_#252d3325]",
            "z-25 px-4 py-4",
            "[&_p]:flex [&_p]:items-start [&_p]:gap-2.5 [&_p]:border-b [&_p]:border-b-line [&_p]:text-[12px]",
            "[&_p]:px-0 [&_p]:py-3 [&_p]:leading-[1.45] [&_p]:text-[#58636b]",
            "[&_p_svg]:text-[#a76c2a]",
            "[&>button]:mt-3",
            "max-[681px]:top-14 max-[681px]:right-3 max-[681px]:w-[min(320px,calc(100vw_-_24px))]",
          )}
        >
          <div className="mb-1.5 flex items-center justify-between text-[14px]">
            <strong>Notifications</strong>
            <button
              className={cn(
                "grid h-8.25 w-8.25 place-items-center rounded-[7px] border-0 bg-transparent text-[#697680]",
                "hover:bg-[#e8eff5] hover:text-primary",
              )}
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
            className={cn(
              "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
              "px-0 py-0.5 whitespace-nowrap",
              "hover:text-[#37444d] hover:underline hover:underline-offset-4",
            )}
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
