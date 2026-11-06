export type Equipment = {
  id: string;
  name: string;
  category: string;
  available: number;
  issued: number;
  faulty: number;
  location: string;
  reorder: number;
};
export type MovementType =
  | "Receipt"
  | "Issue"
  | "Return"
  | "Transfer"
  | "Adjustment"
  | "Stocktake"
  | "Fault"
  | "Repair";
export type Movement = {
  id: string;
  type: MovementType;
  equipmentId: string;
  quantity: number;
  description: string;
  date: string;
  actor: string;
};
export type Fault = {
  id: string;
  equipmentId: string;
  quantity: number;
  title: string;
  location: string;
  custodian: string;
  priority: "Low" | "Medium" | "High";
  status: "Reported" | "In progress" | "Resolved";
  date: string;
  startedAt?: string;
  resolvedAt?: string;
  repairNotes?: string;
  history?: { status: Fault["status"]; date: string; notes?: string }[];
};
export type Receipt = {
  id: string;
  equipmentId: string;
  quantity: number;
  supplier: string;
  reference?: string;
  date: string;
};
export type Issue = {
  id: string;
  equipmentId: string;
  quantity: number;
  returned: number;
  assignee: string;
  department: string;
  date: string;
};
export type Location = { id: string; name: string; kind: string; lead: string };
export type InventoryState = {
  equipment: Equipment[];
  movements: Movement[];
  faults: Fault[];
  receipts: Receipt[];
  issues: Issue[];
  locations: Location[];
};

export const initialState: InventoryState = {
  equipment: [
    {
      id: "EQ-001",
      name: "Dell Latitude 5440",
      category: "Laptops",
      available: 12,
      issued: 8,
      faulty: 2,
      location: "Equipment store",
      reorder: 5,
    },
    {
      id: "EQ-002",
      name: "HP ProBook 450",
      category: "Laptops",
      available: 6,
      issued: 9,
      faulty: 1,
      location: "Equipment store",
      reorder: 5,
    },
    {
      id: "EQ-003",
      name: "Motorola DP4400e",
      category: "Radios",
      available: 15,
      issued: 25,
      faulty: 3,
      location: "Equipment store",
      reorder: 10,
    },
    {
      id: "EQ-004",
      name: "HP LaserJet M404",
      category: "Printers",
      available: 2,
      issued: 6,
      faulty: 1,
      location: "Equipment store",
      reorder: 3,
    },
    {
      id: "EQ-005",
      name: "APC Smart-UPS 1500",
      category: "Power",
      available: 5,
      issued: 7,
      faulty: 1,
      location: "Equipment store",
      reorder: 3,
    },
    {
      id: "EQ-006",
      name: "Dell P2422H",
      category: "Monitors",
      available: 10,
      issued: 20,
      faulty: 0,
      location: "Equipment store",
      reorder: 5,
    },
  ],
  movements: [
    {
      id: "MOV-0006",
      type: "Fault",
      equipmentId: "EQ-003",
      quantity: 3,
      description: "Radio faults reported · Control room",
      date: "2026-11-01T09:10:00Z",
      actor: "Admin Officer",
    },
    {
      id: "MOV-0005",
      type: "Return",
      equipmentId: "EQ-002",
      quantity: 2,
      description: "Returned by Administration · Chidinma Okafor",
      date: "2026-10-30T14:20:00Z",
      actor: "Admin Officer",
    },
    {
      id: "MOV-0004",
      type: "Issue",
      equipmentId: "EQ-003",
      quantity: 4,
      description: "Issued to Operations · Adebayo Olawale",
      date: "2026-10-29T10:30:00Z",
      actor: "Admin Officer",
    },
    {
      id: "MOV-0003",
      type: "Issue",
      equipmentId: "EQ-001",
      quantity: 3,
      description: "Issued to Administration · Chidinma Okafor",
      date: "2026-10-25T13:00:00Z",
      actor: "Admin Officer",
    },
    {
      id: "MOV-0002",
      type: "Issue",
      equipmentId: "EQ-001",
      quantity: 5,
      description: "Issued to Operations · Adebayo Olawale",
      date: "2026-10-23T11:00:00Z",
      actor: "Admin Officer",
    },
    {
      id: "MOV-0001",
      type: "Receipt",
      equipmentId: "EQ-001",
      quantity: 20,
      description: "Received from Dell Nigeria · Equipment store",
      date: "2026-10-21T09:30:00Z",
      actor: "Admin Officer",
    },
  ],
  faults: [
    {
      id: "MNT-0001",
      equipmentId: "EQ-003",
      quantity: 3,
      title: "Intermittent transmission",
      location: "Control room",
      custodian: "Adebayo Olawale",
      priority: "High",
      status: "In progress",
      date: "2026-11-01T09:10:00Z",
    },
    {
      id: "MNT-0002",
      equipmentId: "EQ-001",
      quantity: 2,
      title: "Battery not charging",
      location: "Operations",
      custodian: "Adebayo Olawale",
      priority: "Medium",
      status: "Reported",
      date: "2026-10-28T12:00:00Z",
    },
    {
      id: "MNT-0003",
      equipmentId: "EQ-002",
      quantity: 1,
      title: "Display flicker",
      location: "Administration",
      custodian: "Chidinma Okafor",
      priority: "Medium",
      status: "Reported",
      date: "2026-10-27T14:30:00Z",
    },
    {
      id: "MNT-0004",
      equipmentId: "EQ-004",
      quantity: 1,
      title: "Paper feed error",
      location: "Control room",
      custodian: "Facility team",
      priority: "Low",
      status: "In progress",
      date: "2026-10-26T08:45:00Z",
    },
    {
      id: "MNT-0005",
      equipmentId: "EQ-005",
      quantity: 1,
      title: "Battery replacement",
      location: "Equipment store",
      custodian: "Store officer",
      priority: "Medium",
      status: "Reported",
      date: "2026-10-24T15:20:00Z",
    },
  ],
  receipts: [
    {
      id: "REC-0003",
      equipmentId: "EQ-003",
      quantity: 40,
      supplier: "Motorola Solutions",
      reference: "PO-2026-118",
      date: "2026-10-17T11:00:00Z",
    },
    {
      id: "REC-0002",
      equipmentId: "EQ-002",
      quantity: 15,
      supplier: "HP Nigeria",
      reference: "PO-2026-114",
      date: "2026-10-19T10:00:00Z",
    },
    {
      id: "REC-0001",
      equipmentId: "EQ-001",
      quantity: 20,
      supplier: "Dell Nigeria",
      reference: "PO-2026-112",
      date: "2026-10-21T09:30:00Z",
    },
  ],
  issues: [
    {
      id: "ISS-0001",
      equipmentId: "EQ-001",
      quantity: 5,
      returned: 0,
      assignee: "Adebayo Olawale",
      department: "Operations",
      date: "2026-10-23T11:00:00Z",
    },
    {
      id: "ISS-0002",
      equipmentId: "EQ-001",
      quantity: 3,
      returned: 0,
      assignee: "Chidinma Okafor",
      department: "Administration",
      date: "2026-10-25T13:00:00Z",
    },
    {
      id: "ISS-0003",
      equipmentId: "EQ-003",
      quantity: 4,
      returned: 0,
      assignee: "Adebayo Olawale",
      department: "Operations",
      date: "2026-10-29T10:30:00Z",
    },
    {
      id: "ISS-0004",
      equipmentId: "EQ-002",
      quantity: 4,
      returned: 2,
      assignee: "Chidinma Okafor",
      department: "Administration",
      date: "2026-10-22T09:00:00Z",
    },
  ],
  locations: [
    {
      id: "LOC-01",
      name: "Equipment store",
      kind: "Store",
      lead: "Store officer",
    },
    {
      id: "LOC-02",
      name: "Operations",
      kind: "Department",
      lead: "Adebayo Olawale",
    },
    {
      id: "LOC-03",
      name: "Administration",
      kind: "Department",
      lead: "Chidinma Okafor",
    },
    {
      id: "LOC-04",
      name: "Control room",
      kind: "Facility",
      lead: "Facility team",
    },
  ],
};

export function nextId(prefix: string, current: { id: string }[]) {
  const largest = Math.max(
    0,
    ...current.map((item) => Number(item.id.split("-").at(-1)) || 0),
  );
  return `${prefix}-${String(largest + 1).padStart(4, "0")}`;
}

export function formatDate(date: string, long = false) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
  }).format(new Date(date));
}

export function equipmentName(items: Equipment[], id: string) {
  return items.find((item) => item.id === id)?.name || "Unknown equipment";
}
