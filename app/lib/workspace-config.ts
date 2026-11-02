export type View =
  | "overview"
  | "inventory"
  | "receipts"
  | "issues"
  | "maintenance"
  | "locations"
  | "movements"
  | "reports"
  | "settings";
export type FormKind =
  | "receive"
  | "issue"
  | "return"
  | "fault"
  | "equipment"
  | "edit"
  | "location"
  | "transfer"
  | "adjust"
  | "stocktake";
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
    title: "Issues & returns",
    description: "Track who holds equipment and what has come back.",
  },
  maintenance: {
    title: "Maintenance",
    description: "Report faults, follow repairs and keep custody visible.",
  },
  locations: {
    title: "Locations",
    description: "Know where equipment belongs and who is responsible.",
  },
  movements: {
    title: "Stock movements",
    description: "A traceable history of every change to your stock.",
  },
  reports: {
    title: "Reports",
    description: "Turn operational data into a useful snapshot.",
  },
  settings: {
    title: "Settings",
    description: "Workspace preferences and demo data controls.",
  },
};

export const formTitles: Record<FormKind, string> = {
  receive: "Receive stock",
  issue: "Issue equipment",
  return: "Record a return",
  fault: "Report a fault",
  equipment: "Add equipment",
  edit: "Edit equipment",
  location: "Add location",
  transfer: "Transfer equipment",
  adjust: "Adjust stock",
  stocktake: "Record stocktake",
};

