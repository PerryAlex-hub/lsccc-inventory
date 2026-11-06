import { nextId, type Equipment, type Fault, type InventoryState, type Movement } from "./demo-data";
import type { FormKind } from "./workspace-config";
import { parseLocalDateTime } from "./workspace-utils";

type Result = { state: InventoryState; error: string | null; equipmentId?: string };

export function applyInventoryForm(state: InventoryState, kind: FormKind, fields: Record<string, string>, now = new Date().toISOString()): Result {
  const fail = (error: string): Result => ({ state, error });
  const creating = kind === "equipment" || (kind === "receive" && fields.equipmentId === "new");
  const editing = kind === "edit";
  const item = state.equipment.find((entry) => entry.id === fields.equipmentId);
  const text = (key: string) => fields[key]?.trim() || "";
  let equipment = state.equipment;
  let equipmentId = item?.id || "";

  if (creating || editing) {
    if (!text("name")) return fail("Enter the equipment name.");
    if (state.equipment.some((entry) => entry.id !== (editing ? item?.id : undefined) && entry.name.toLowerCase() === text("name").toLowerCase()))
      return fail("This equipment is already registered. Select it from the equipment list.");
    const category = text("category") === "Other" ? text("customCategory") : text("category");
    const location = text("location") === "Other" ? text("customLocation") : text("location");
    if (!category) return fail("Enter a category to group this equipment.");
    if (!location) return fail("Enter the primary store name.");
    const reorder = Number(fields.reorder || 0);
    if (!Number.isSafeInteger(reorder) || reorder < 0) return fail("Low-stock alert level must be a non-negative whole number.");
    if (editing && !item) return fail("Choose the equipment to edit.");
    equipmentId = editing ? item!.id : nextId("EQ", state.equipment);
    const details = { name: text("name"), category, location, reorder };
    equipment = editing
      ? state.equipment.map((entry) => entry.id === equipmentId ? { ...entry, ...details } : entry)
      : [...state.equipment, { id: equipmentId, ...details, available: 0, issued: 0, faulty: 0 }];
    if (kind === "equipment" || editing) return { state: { ...state, equipment }, error: null, equipmentId };
  }

  if (!equipmentId) return fail("Select equipment, or register it before recording stock.");
  const qty = Number(fields.quantity);
  if (!Number.isSafeInteger(qty) || qty < 1) return fail("Enter a whole quantity of at least 1.");
  if (kind === "issue" && item && qty > item.available) return fail(`Only ${item.available} units are available. Receive stock before issuing more.`);
  if (kind === "fault" && item && qty > item.issued - item.faulty) return fail(`Only ${item.issued - item.faulty} issued units can be reported. Units already under maintenance are excluded.`);

  let date = now;
  if (kind === "receive") {
    if (!text("supplier")) return fail("Enter the supplier or source of this stock.");
    const receivedAt = parseLocalDateTime(fields.receivedAt || "");
    if (!receivedAt) return fail("Choose a valid received date and time.");
    if (receivedAt > now) return fail("The received date and time cannot be in the future.");
    date = receivedAt;
  }
  if (kind === "issue" && (!text("assignee") || !text("department"))) return fail("Enter the custodian and department receiving this equipment.");
  if (kind === "fault" && (!text("title") || !text("location") || !text("custodian"))) return fail("Enter the fault description, current location and custodian.");
  if (kind === "fault" && !["Low", "Medium", "High"].includes(fields.priority)) return fail("Choose a valid priority.");

  const update = (change: (entry: Equipment) => Equipment) => equipment.map((entry) => entry.id === equipmentId ? change(entry) : entry);
  const movement = (type: Movement["type"], description: string): Movement => ({
    id: nextId("MOV", state.movements), type, equipmentId, quantity: qty, description, date, actor: "Admin Officer",
  });
  if (kind === "receive") return {
    error: null, equipmentId,
    state: { ...state,
      equipment: update((entry) => ({ ...entry, available: entry.available + qty })),
      receipts: [{ id: nextId("REC", state.receipts), equipmentId, quantity: qty, supplier: text("supplier"), date }, ...state.receipts],
      movements: [movement("Receipt", `Received from ${text("supplier")} · ${equipment.find((entry) => entry.id === equipmentId)?.location}`), ...state.movements],
    },
  };
  if (kind === "issue") return {
    error: null,
    state: { ...state,
      equipment: update((entry) => ({ ...entry, available: entry.available - qty, issued: entry.issued + qty })),
      issues: [{ id: nextId("ISS", state.issues), equipmentId, quantity: qty, returned: 0, assignee: text("assignee"), department: text("department"), date }, ...state.issues],
      movements: [movement("Issue", `Issued to ${text("department")} · ${text("assignee")}`), ...state.movements],
    },
  };
  if (kind === "fault") return {
    error: null,
    state: { ...state,
      equipment: update((entry) => ({ ...entry, faulty: entry.faulty + qty })),
      faults: [{ id: nextId("MNT", state.faults), equipmentId, quantity: qty, title: text("title"), location: text("location"), custodian: text("custodian"), priority: fields.priority as Fault["priority"], status: "Reported", date, history: [{ status: "Reported", date }] }, ...state.faults],
      movements: [movement("Fault", `${text("title")} · ${text("location")}`), ...state.movements],
    },
  };
  return fail("This action is no longer available.");
}

export type RepairDetails = { fixedAt: string; notes: string };

export function transitionFault(state: InventoryState, id: string, status: Fault["status"], details?: RepairDetails, now = new Date().toISOString()): Result {
  const fail = (error: string): Result => ({ state, error });
  const fault = state.faults.find((entry) => entry.id === id);
  if (!fault) return fail("This maintenance record could not be found.");
  if (!((fault.status === "Reported" && status === "In progress") || (fault.status === "In progress" && status === "Resolved")))
    return fail("Follow the repair stages: reported, in progress, then fixed.");
  let date = now;
  if (status === "Resolved") {
    const fixedAt = parseLocalDateTime(details?.fixedAt || "");
    if (!fixedAt) return fail("Choose the date and time the equipment was fixed.");
    if (fixedAt < fault.date.slice(0, 16) + ":00.000Z") return fail("The fixed date cannot be before the fault was reported.");
    if (fault.startedAt && fixedAt < fault.startedAt.slice(0, 16) + ":00.000Z") return fail("The fixed date cannot be before the repair started.");
    if (fixedAt > now) return fail("The fixed date and time cannot be in the future.");
    if (!details?.notes.trim()) return fail("Describe the fix so the repair record is useful later.");
    date = fixedAt;
  }
  const history = fault.history || [{ status: "Reported" as const, date: fault.date }, ...(fault.startedAt ? [{ status: "In progress" as const, date: fault.startedAt }] : [])];
  return { error: null, state: { ...state,
    faults: state.faults.map((entry) => entry.id !== id ? entry : {
      ...entry, status,
      ...(status === "In progress" ? { startedAt: date } : { resolvedAt: date, repairNotes: details!.notes.trim() }),
      history: [...history, { status, date, ...(details ? { notes: details.notes.trim() } : {}) }],
    }),
    equipment: status === "Resolved" ? state.equipment.map((entry) => entry.id === fault.equipmentId ? { ...entry, faulty: Math.max(0, entry.faulty - fault.quantity) } : entry) : state.equipment,
    movements: status === "Resolved" ? [{ id: nextId("MOV", state.movements), type: "Repair", equipmentId: fault.equipmentId, quantity: fault.quantity, description: `Repair completed · ${fault.title} · ${details!.notes.trim()}`, date, actor: "Admin Officer" }, ...state.movements] : state.movements,
  } };
}
