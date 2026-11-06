"use client";

import { useState, type FormEvent } from "react";
import { equipmentName, type InventoryState } from "../../lib/demo-data";
import { formTitles, type FormKind } from "../../lib/workspace-config";
import { Icon } from "../ui/icons";

export function ActionPanel({
  kind,
  state,
  initialEquipmentId,
  onClose,
  onSubmit,
}: {
  kind: FormKind;
  state: InventoryState;
  initialEquipmentId: string | null;
  onClose: () => void;
  onSubmit: (kind: FormKind, fields: Record<string, string>) => string | null;
}) {
  const existingEquipment = state.equipment.find(
    (item) => item.id === initialEquipmentId,
  );
  const [fields, setFields] = useState<Record<string, string>>({
    equipmentId: initialEquipmentId || state.equipment[0]?.id || "",
    quantity:
      kind === "stocktake"
        ? String(existingEquipment?.available ?? state.equipment[0]?.available ?? 0)
        : "1",
    name: kind === "edit" ? existingEquipment?.name || "" : "",
    category:
      kind === "edit" ? existingEquipment?.category || "Other" : "Laptops",
    location:
      kind === "fault"
        ? ""
        : kind === "edit"
          ? existingEquipment?.location || "Equipment store"
          : "Equipment store",
    reorder:
      kind === "edit" ? String(existingEquipment?.reorder ?? 0) : "",
    priority: "Medium",
    kind: "Department",
    from: "Equipment store",
    to: "Operations",
  });
  const [error, setError] = useState("");
  const set = (name: string, value: string) =>
    setFields((current) => ({ ...current, [name]: value }));
  const input = (
    name: string,
    label: string,
    placeholder: string,
    required = true,
    type = "text",
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={fields[name] || ""}
        placeholder={placeholder}
        required={required}
        onChange={(e) => set(name, e.target.value)}
      />
    </label>
  );
  const select = (
    name: string,
    label: string,
    options: { value: string; label: string }[],
  ) => (
    <label className="field">
      <span>{label}</span>
      <select
        value={fields[name] || options[0]?.value}
        onChange={(e) => {
          if (name === "issueId") {
            const issue = state.issues.find(
              (entry) => entry.id === e.target.value,
            );
            setFields((current) => ({
              ...current,
              issueId: e.target.value,
              equipmentId: issue?.equipmentId || current.equipmentId,
              department: issue?.department || current.department,
            }));
          } else if (name === "equipmentId" && kind === "stocktake") {
            const equipment = state.equipment.find(
              (item) => item.id === e.target.value,
            );
            setFields((current) => ({
              ...current,
              equipmentId: e.target.value,
              quantity: String(equipment?.available ?? 0),
            }));
          } else set(name, e.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
  const equipmentOptions = state.equipment.map((e) => ({
    value: e.id,
    label:
      kind === "fault"
        ? `${e.name} Â· ${e.issued - e.faulty} eligible`
        : `${e.name} Â· ${e.available} available`,
  }));
  const selectedIssue = state.issues.find((i) => i.id === fields.issueId);
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = onSubmit(kind, fields);
    if (result) setError(result);
  }
  return (
    <div className="drawer-layer">
      <button
        className="drawer-scrim"
        aria-label={`Close ${formTitles[kind]}`}
        onClick={onClose}
      />
      <aside className="drawer action-drawer" aria-label={formTitles[kind]}>
        <div className="drawer-head">
          <span>{kind === "edit" ? "EQUIPMENT RECORD" : "NEW RECORD"}</span>
          <button
            className="icon-button"
            aria-label={`Close ${formTitles[kind]}`}
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="drawer-body">
            <div className="form-intro">
              <span className="form-intro-icon">
                <Icon
                  name={
                    kind === "fault"
                      ? "tool"
                      : kind === "location"
                        ? "pin"
                        : kind === "equipment" || kind === "edit"
                          ? "box"
                          : kind === "issue"
                            ? "arrow"
                            : "inbox"
                  }
                  size={24}
                />
              </span>
              <h2>{formTitles[kind]}</h2>
              <p>
                {kind === "receive"
                  ? "Log a delivery and make stock available for issue."
                  : kind === "issue"
                    ? "Assign equipment to a named person and department."
                    : kind === "return"
                      ? "Close the loop on equipment coming back to store."
                      : kind === "fault"
                        ? "Keep the fault linked to its location and custodian."
                        : kind === "equipment"
                          ? "Create an equipment type before receiving stock."
                          : kind === "edit"
                            ? "Update the information used throughout the workspace."
                            : kind === "stocktake"
                              ? "Count the units ready in store and record any difference."
                          : kind === "location"
                            ? "Add a place or department to the workspace."
                            : kind === "adjust"
                              ? "Correct available stock with a recorded reason."
                              : "Record a movement between locations."}
              </p>
            </div>
            {kind === "equipment" || kind === "edit" ? (
              <>
                {input("name", "Equipment name", "e.g. Lenovo ThinkPad T14")}
                {select(
                  "category",
                  "Category",
                  [
                    "Laptops",
                    "Radios",
                    "Printers",
                    "Power",
                    "Monitors",
                    "Other",
                  ].map((x) => ({ value: x, label: x })),
                )}
                {select(
                  "location",
                  "Primary store",
                  state.locations.map((l) => ({
                    value: l.name,
                    label: l.name,
                  })),
                )}
                {input("reorder", "Low-stock alert at (optional)", "e.g. 5", false, "number")}
                <p className="field-hint">Shows a low-stock alert when available units reach this number. Use 0 to alert only when stock is empty.</p>
              </>
            ) : kind === "location" ? (
              <>
                {input("name", "Location name", "e.g. Field office")}
                {select(
                  "kind",
                  "Location type",
                  ["Department", "Store", "Facility"].map((x) => ({
                    value: x,
                    label: x,
                  })),
                )}
                {input("lead", "Responsible person", "Name or team")}
              </>
            ) : (
              <>
                {kind === "return" &&
                  select("issueId", "Issue reference", [
                    { value: "", label: "Select an active issue" },
                    ...state.issues
                      .filter((i) => i.returned < i.quantity)
                      .map((i) => ({
                        value: i.id,
                        label: `${i.id} Â· ${i.assignee} Â· ${i.quantity - i.returned} outstanding`,
                      })),
                  ])}
                {select("equipmentId", "Equipment", equipmentOptions)}
                {selectedIssue && kind === "return" && (
                  <p className="field-hint">
                    Selected issue:{" "}
                    {equipmentName(state.equipment, selectedIssue.equipmentId)}{" "}
                    Â· {selectedIssue.quantity - selectedIssue.returned} units
                    outstanding
                  </p>
                )}
                {input(
                  "quantity",
                  kind === "adjust"
                    ? "Quantity change (+ or âˆ’)"
                    : kind === "stocktake"
                      ? "Counted available"
                      : "Quantity",
                  kind === "adjust"
                    ? "e.g. -1"
                    : kind === "stocktake"
                      ? "Units physically counted in store"
                      : "Number of units",
                  true,
                  "number",
                )}
                {kind === "stocktake" && (
                  <p className="field-hint">
                    Recorded available: {state.equipment.find((e) => e.id === fields.equipmentId)?.available ?? 0} units. The difference will be logged in movement history.
                  </p>
                )}
                {kind === "receive" && (
                  <>
                    {input("supplier", "Supplier", "Supplier or source")}
                    {input(
                      "reference",
                      "Delivery reference",
                      "e.g. PO-2026-119",
                    )}
                  </>
                )}
                {kind === "issue" && (
                  <>
                    {input("assignee", "Custodian", "Full name")}
                    {input("department", "Department", "e.g. Operations")}
                  </>
                )}
                {kind === "return" &&
                  input(
                    "department",
                    "Returning department",
                    "e.g. Operations",
                    false,
                  )}
                {kind === "fault" && (
                  <>
                    {input(
                      "title",
                      "Fault description",
                      "Brief description of the problem",
                    )}
                    {select(
                      "priority",
                      "Priority",
                      ["Low", "Medium", "High"].map((x) => ({
                        value: x,
                        label: x,
                      })),
                    )}
                    {input(
                      "location",
                      "Current location",
                      "Where is the equipment?",
                    )}
                    {input(
                      "custodian",
                      "Current custodian",
                      "Full name or team",
                    )}
                  </>
                )}
                {kind === "adjust" &&
                  input(
                    "reason",
                    "Reason for adjustment",
                    "Explain the correction",
                  )}
                {kind === "stocktake" &&
                  input(
                    "reason",
                    "Count note",
                    "e.g. Monthly stock count",
                  )}
                {kind === "transfer" && (
                  <>
                    {select(
                      "from",
                      "From",
                      state.locations.map((l) => ({
                        value: l.name,
                        label: l.name,
                      })),
                    )}
                    {select(
                      "to",
                      "To",
                      state.locations.map((l) => ({
                        value: l.name,
                        label: l.name,
                      })),
                    )}
                  </>
                )}
              </>
            )}
            {error && (
              <div className="form-error" role="alert">
                <Icon name="alert" size={17} />
                {error}
              </div>
            )}
          </div>
          <div className="drawer-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button primary">
              {kind === "edit" ? "Save changes" : "Save record"} <Icon name="arrow" size={16} />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

