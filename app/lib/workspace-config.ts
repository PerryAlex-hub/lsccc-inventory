export type View =
  | "overview"
  | "inventory"
  | "receipts"
  | "issues"
  | "maintenance"
  | "movements"
  | "reports"
  | "settings";
export type FormKind =
  | "receive"
  | "issue"
  | "fault"
  | "equipment"
  | "edit";
export const headings: Record<View, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description:
      "A clear picture of stock, custody and maintenance across the centre.",
  },
  inventory: {
    title: "Inventory",
    description: "Equipment types and live quantity balances.",
  },
  receipts: {
    title: "Receipts",
    description: "Every delivery into the equipment store, in one place.",
  },
  issues: {
    title: "Equipment issues",
    description: "Track equipment assigned to staff and departments.",
  },
  maintenance: {
    title: "Maintenance",
    description: "Report faults, follow repairs and keep custody visible.",
  },
  movements: {
    title: "Activity history",
    description: "An automatic record of receipts, equipment issues and repairs.",
  },
  reports: {
    title: "Reports",
    description: "Turn operational data into a useful snapshot.",
  },
  settings: {
    title: "Settings",
    description: "Manage team access and workspace permissions.",
  },
};

export const formTitles: Record<FormKind, string> = {
  receive: "Receive stock",
  issue: "Issue equipment",
  fault: "Report a fault",
  equipment: "Add equipment",
  edit: "Edit equipment",
};

