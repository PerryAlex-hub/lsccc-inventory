import { cn } from "@/app/lib/cn";
import Image from "next/image";
import type { View } from "../../lib/workspace-config";
import { Icon, type IconName } from "../ui/icons";

const nav: {
  label: string;
  view: View;
  icon: IconName;
}[] = [
  { label: "Overview", view: "overview", icon: "grid" },
  { label: "Inventory", view: "inventory", icon: "box" },
  { label: "Receipts", view: "receipts", icon: "inbox" },
  { label: "Equipment issues", view: "issues", icon: "arrows" },
  { label: "Maintenance", view: "maintenance", icon: "tool" },
  { label: "Activity history", view: "movements", icon: "history" },
  { label: "Reports", view: "reports", icon: "chart" },
];

type NavigationItemProps = {
  icon: IconName;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
};

function NavigationItem({ icon, label, active, badge, onClick }: NavigationItemProps) {
  return (
    <button
      className={cn(
        "group flex h-10.5 w-full items-center gap-3.25 rounded-[8px] border-0 bg-transparent px-3.25 py-0 text-left",
        "text-[12.5px] font-[570] text-[#59656d] transition-colors duration-160",
        "hover:bg-[#f4f7f4] hover:text-primary",
        "data-[active=true]:bg-[#edf2f4] data-[active=true]:font-[720] data-[active=true]:text-[#243b48]",
      )}
      data-active={active}
      onClick={onClick}
    >
      <Icon
        name={icon}
        size={18}
        className="text-[#7a8a95] group-data-[active=true]:text-[#243b48]"
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <em className="rounded-[6px] bg-[#fcf0de] px-1.5 py-0.5 text-[10px] font-[720] text-[#aa6826] not-italic">
          {badge}
        </em>
      )}
    </button>
  );
}

type Props = {
  view: View;
  mobileNav: boolean;
  setMobileNav: (open: boolean) => void;
  navigate: (view: View) => void;
  openFaultCount: number;
};

export function Sidebar({
  view,
  mobileNav,
  setMobileNav,
  navigate,
  openFaultCount,
}: Props) {
  return (
    <>
      <aside
        className={cn(
          "fixed [inset:0_auto_0_0] z-30 flex w-62.5 flex-col border-r border-r-line bg-white px-3.5 pt-7 pb-4.5",
          "max-[1181px]:w-55",
          "max-[921px]:-translate-x-full max-[921px]:transition-transform max-[921px]:duration-220 max-[921px]:ease-in-out",
          "max-[921px]:shadow-[10px_0_40px_#1f262b21]",
          "max-[921px]:[&[data-open=true]]:translate-x-0",
        )}
        data-open={mobileNav}
        aria-label="Main navigation"
      >
        <div
          className={cn(
            "flex items-center gap-2.75 px-3.25 pt-0 pb-9.5",
            "[&_strong]:block [&_strong]:text-[19px] [&_strong]:leading-[1] [&_strong]:font-[790]",
            "[&_strong]:tracking-[-.07em]",
            "[&_small]:mt-1.75 [&_small]:block [&_small]:text-[8px] [&_small]:leading-[1] [&_small]:tracking-[.11em]",
            "[&_small]:font-[750] [&_small]:text-[#798994]",
          )}
        >
          <Image
            className="h-10.5 w-10.5 flex-none object-contain"
            src="/lsccc-logo.jpg"
            alt="Lagos State Command and Control Centre crest"
            width={42}
            height={42}
            priority
          />
          <div>
            <strong>LSCCC</strong>
            <small>Inventory workspace</small>
          </div>
        </div>
        <div className="mb-3 px-3.5 py-0 text-[9px] font-[750] tracking-[.16em] text-[#8d9fac]">
          WORKSPACE
        </div>
        <nav className="grid gap-0.75">
          {nav.map((entry) => (
            <NavigationItem
              key={entry.view}
              icon={entry.icon}
              label={entry.label}
              active={view === entry.view}
              badge={entry.view === "maintenance" ? openFaultCount : undefined}
              onClick={() => navigate(entry.view)}
            />
          ))}
        </nav>
        <div className={cn("mt-auto", "[&>div:first-child]:mb-2")}>
          <div className="mb-3 px-3.5 py-0 text-[9px] font-[750] tracking-[.16em] text-[#8d9fac]">
            PREFERENCES
          </div>
          <NavigationItem
            icon="settings"
            label="Settings"
            active={view === "settings"}
            onClick={() => navigate("settings")}
          />
          <div
            className={cn(
              "mt-4.25 flex items-center gap-2.5 border-t border-t-line px-1.75 pt-4.25 pb-0",
              "[&_strong]:block [&_strong]:text-[11px] [&_strong]:whitespace-nowrap",
              "[&_small]:mt-0.75 [&_small]:block [&_small]:text-[9px] [&_small]:whitespace-nowrap [&_small]:text-[#7d8d98]",
              "[&_svg]:text-[#90a2af]",
              "[&_div:nth-child(2)]:min-w-0 [&_div:nth-child(2)]:flex-1",
            )}
          >
            <div className="grid h-8.5 w-8.5 place-items-center rounded-[10px] bg-[#e8e3d6] text-[11px] font-[780] text-[#3f4d57]">
              AO
            </div>
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
          className={cn(
            "hidden",
            "max-[921px]:fixed max-[921px]:[inset:0] max-[921px]:z-29 max-[921px]:block max-[921px]:border-0",
            "max-[921px]:bg-[#1f262b66]",
          )}
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
    </>
  );
}
