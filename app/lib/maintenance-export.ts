import { equipmentName, type InventoryState } from "./demo-data";
import { formatDateTime } from "./workspace-utils";

export function maintenanceCsvRows(
  state: InventoryState,
  fixed: boolean,
): (string | number)[][] {
  const rows = state.faults.filter((fault) => (fault.status === "Resolved") === fixed);
  return [
    [
      "Record",
      "Equipment",
      "Units",
      "Issue",
      "Priority",
      "Status",
      "Location",
      "Custodian",
      "Reported (Lagos)",
      "Repair started (Lagos)",
      "Fixed (Lagos)",
      "Work completed",
    ],
    ...rows.map((fault) => [
      fault.id,
      equipmentName(state.equipment, fault.equipmentId),
      fault.quantity,
      fault.title,
      fault.priority,
      fault.status === "Resolved" ? "Fixed" : fault.status,
      fault.location,
      fault.custodian,
      formatDateTime(fault.date),
      fault.startedAt ? formatDateTime(fault.startedAt) : "",
      fault.resolvedAt ? formatDateTime(fault.resolvedAt) : "",
      fault.repairNotes || "",
    ]),
  ];
}
