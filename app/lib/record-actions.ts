import type { InventoryState } from "./demo-data";

export const recordCollections = [
  "equipment",
  "receipts",
  "issues",
  "faults",
  "movements",
] as const;
export type RecordCollection = (typeof recordCollections)[number];
export type RecordAction = "archive" | "restore" | "delete";
export type RecordTarget = { collection: RecordCollection; id: string; label: string };
export type RecordRequest = RecordTarget & { action: RecordAction };

export function recordActionDescription(
  collection: RecordCollection,
  action: RecordAction,
) {
  if (action === "archive")
    return "Move this record to Archived. You can restore it later. Stock balances and linked records will stay unchanged.";
  if (action === "restore")
    return "Return this record to the active list. Stock balances will stay unchanged.";
  const effects: Record<RecordCollection, string> = {
    equipment:
      "Only equipment with zero stock and no linked receipts, issues, maintenance or movements can be deleted. Archive equipment to retain its history.",
    receipts:
      "This reverses the delivery and removes its quantity from available stock. Deletion is blocked if there is not enough available stock.",
    issues:
      "This reverses the issue and returns its outstanding units to available stock. Records with returns or linked maintenance cannot be deleted.",
    faults:
      "This removes the maintenance record and its repair history. For an open fault, its units will no longer be marked faulty. Stock custody stays unchanged.",
    movements:
      "This removes this activity entry only. Stock balances and the original receipt, issue or maintenance record stay unchanged.",
  };
  return `${effects[collection]}${["receipts", "issues", "faults"].includes(collection) ? " Existing activity entries remain in the movement history." : ""} This cannot be undone.`;
}

export function applyRecordAction(
  state: InventoryState,
  collection: RecordCollection,
  id: string,
  action: RecordAction,
  now = new Date().toISOString(),
): { state: InventoryState; error: string | null } {
  const fail = (error: string) => ({ state, error });
  if (
    !recordCollections.includes(collection) ||
    !["archive", "restore", "delete"].includes(action)
  )
    return fail("Choose a valid record action.");
  const record = state[collection].find((entry) => entry.id === id);
  if (!record)
    return fail("This record no longer exists. Refresh the list and try again.");
  if (action !== "delete") {
    if (action === "archive" && record.archivedAt)
      return fail("This record is already archived.");
    if (action === "restore" && !record.archivedAt)
      return fail("This record is already active.");
    return {
      state: {
        ...state,
        [collection]: state[collection].map((entry) =>
          entry.id === id
            ? { ...entry, archivedAt: action === "archive" ? now : null }
            : entry,
        ),
      },
      error: null,
    };
  }

  let equipment = state.equipment;
  if (collection === "equipment") {
    const item = state.equipment.find((entry) => entry.id === id)!;
    if (item.available || item.issued || item.faulty)
      return fail(
        "Equipment with stock cannot be deleted. Archive it to retain its balances.",
      );
    if (
      [...state.receipts, ...state.issues, ...state.faults, ...state.movements].some(
        (entry) => entry.equipmentId === id,
      )
    )
      return fail("This equipment has linked records. Archive it to retain its history.");
  } else if (collection !== "movements") {
    const stockRecord = record as InventoryState["receipts"][number];
    const item = state.equipment.find((entry) => entry.id === stockRecord.equipmentId);
    if (!item) return fail("The equipment for this record could not be found.");
    let available = item.available,
      issued = item.issued,
      faulty = item.faulty;
    if (collection === "receipts") {
      if (available < stockRecord.quantity)
        return fail(
          "There is not enough available stock to reverse this delivery. Archive the receipt instead.",
        );
      available -= stockRecord.quantity;
    } else if (collection === "issues") {
      const issue = state.issues.find((entry) => entry.id === id)!;
      // Faults have equipment-level links, so conservatively retain every issue for
      // equipment with maintenance history, including archived maintenance.
      if (issue.returned || state.faults.some((entry) => entry.equipmentId === item.id))
        return fail(
          "This issue has returns or equipment maintenance history. Archive it to retain those links.",
        );
      if (issued - issue.quantity < faulty)
        return fail(
          "This issue cannot be reversed without making the stock balance invalid. Archive it instead.",
        );
      available += issue.quantity;
      issued -= issue.quantity;
    } else {
      const fault = state.faults.find((entry) => entry.id === id)!;
      if (fault.status !== "Resolved") faulty -= fault.quantity;
      if (faulty < 0)
        return fail(
          "This fault cannot be removed without making the faulty balance invalid.",
        );
    }
    equipment = state.equipment.map((entry) =>
      entry.id === item.id ? { ...entry, available, issued, faulty } : entry,
    );
  }
  return {
    state: {
      ...state,
      equipment,
      [collection]: state[collection].filter((entry) => entry.id !== id),
    },
    error: null,
  };
}
