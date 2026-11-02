export type IconName =
  | "grid"
  | "box"
  | "inbox"
  | "arrows"
  | "tool"
  | "pin"
  | "history"
  | "chart"
  | "settings"
  | "activity"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "chevron"
  | "close"
  | "menu"
  | "download"
  | "filter"
  | "check"
  | "alert"
  | "laptop"
  | "radio"
  | "printer"
  | "power"
  | "monitor"
  | "package"
  | "users"
  | "clock"
  | "more";

export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
        <path d="m3 7 9 4 9-4M12 11v10" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 4h16v11l-3 5H7l-3-5V4Z" />
        <path d="M4 14h5l1.5 2h3l1.5-2h5" />
      </>
    ),
    arrows: (
      <>
        <path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" />
      </>
    ),
    tool: (
      <>
        <path d="M14.2 6.2a5 5 0 0 0-6.4 6.4L3.5 16.5a2.8 2.8 0 0 0 4 4l4.3-4.3a5 5 0 0 0 6.4-6.4l-3 3-4-1 1-4 3-3Z" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V4m0 16h16M8 16v-5m4 5V7m4 9V9m4 7V5" />
      </>
    ),
    settings: (
      <>
        <path d="m9.7 3-.5 2.1-2 .9-1.8-1.1-2 3.4 1.7 1.3-.2 2.4-1.9 1 1.4 3.7 2.1-.4 1.7 1.6-.3 2.1 3.8 1 1-1.9 2.3-.3 1.4 1.6 3.3-2.1-1.1-1.8.8-2.1 2.1-.6-.2-4-2.1-.4-.9-2 1-1.9-3.4-1.9-1.4 1.7-2.2-.2L11.5 3H9.7Z" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l3-7 4 14 3-7h4" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 4v16M4 12h16" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    chevron: (
      <>
        <path d="m9 5 7 7-7 7" />
      </>
    ),
    close: (
      <>
        <path d="M5 5 19 19M19 5 5 19" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3" />
      </>
    ),
    filter: (
      <>
        <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />
      </>
    ),
    check: (
      <>
        <path d="m4 12 5 5L20 6" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2L12 3ZM12 9v5m0 3h.01" />
      </>
    ),
    laptop: (
      <>
        <rect x="4" y="4" width="16" height="12" rx="1.5" />
        <path d="M2 20h20l-2-4H4l-2 4Z" />
      </>
    ),
    radio: (
      <>
        <rect x="6" y="7" width="12" height="14" rx="2" />
        <path d="m8 7 8-4M9 12h6m-6 3h4" />
        <circle cx="15" cy="17" r="1" />
      </>
    ),
    printer: (
      <>
        <path d="M6 8V3h12v5M6 17H4V9h16v8h-2M6 14h12v7H6v-7Z" />
        <path d="M16 11h2" />
      </>
    ),
    power: (
      <>
        <path d="M12 3v9M7 6.5a8 8 0 1 0 10 0" />
      </>
    ),
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 21h8m-4-3v3" />
      </>
    ),
    package: (
      <>
        <path d="M4 7h16v13H4V7Zm0 4h16M8 7V4h8v3" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5h-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export const categoryIcon = (category: string): IconName =>
  (({
    Laptops: "laptop",
    Radios: "radio",
    Printers: "printer",
    Power: "power",
    Monitors: "monitor",
  })[category] as IconName) || "box";
