"use client";

import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Field, Input, Select, FormHint } from "@/app/components/ui/form-fields";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { InventoryState } from "../../lib/demo-data";
import { formTitles, type FormKind } from "../../lib/workspace-config";
import { localDateTime } from "../../lib/workspace-utils";
import { Icon } from "../ui/icons";

const baseCategories = ["Laptops", "Radios", "Printers", "Power", "Monitors"];

export function ActionPanel({
  kind,
  state,
  initialEquipmentId,
  onClose,
  onSubmit,
  onReceive,
}: {
  kind: FormKind;
  state: InventoryState;
  initialEquipmentId: string | null;
  onClose: () => void;
  onSubmit: (kind: FormKind, fields: Record<string, string>) => string | null;
  onReceive: (equipmentId: string | null) => void;
}) {
  const existing = state.equipment.find((item) => item.id === initialEquipmentId);
  const stores = [
    ...new Set([
      "Equipment store",
      ...state.equipment.map((item) => item.location),
      ...state.locations
        .filter((location) => location.kind === "Store")
        .map((location) => location.name),
    ]),
  ].filter((name) => name !== "Other");
  const categories = [
    ...new Set([...baseCategories, ...state.equipment.map((item) => item.category)]),
  ].filter((name) => name !== "Other");
  const [fields, setFields] = useState<Record<string, string>>({
    equipmentId:
      existing?.id || (kind === "receive" && !state.equipment.length ? "new" : ""),
    quantity: "1",
    name: kind === "edit" ? existing?.name || "" : "",
    category: kind === "edit" ? existing?.category || "Other" : "",
    location:
      kind === "fault"
        ? ""
        : kind === "edit"
          ? existing?.location || "Equipment store"
          : "Equipment store",
    reorder: kind === "edit" ? String(existing?.reorder ?? 0) : "",
    priority: "Medium",
    receivedAt: localDateTime(),
  });
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const controls = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)",
        ) || [],
      );
    controls()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = controls();
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1)?.focus();
      }
      if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0]?.focus();
      }
    };
    panel?.addEventListener("keydown", trap);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      panel?.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  const set = (name: string, value: string) => {
    setError("");
    setFields((current) => ({ ...current, [name]: value }));
  };
  const input = (
    name: string,
    label: string,
    placeholder: string,
    required = true,
    type = "text",
    min?: number | string,
    max?: number | string,
  ) => (
    <Field>
      <span>{label}</span>
      <Input
        name={name}
        type={type}
        value={fields[name] || ""}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={type === "number" ? 1 : undefined}
        onChange={(event) => set(name, event.target.value)}
      />
    </Field>
  );
  const select = (
    name: string,
    label: string,
    options: {
      value: string;
      label: string;
    }[],
  ) => (
    <Field>
      <span>{label}</span>
      <Select
        name={name}
        aria-label={label}
        value={fields[name] || ""}
        required
        onChange={(event) => set(name, event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
  const equipmentFields = (
    <>
      {input("name", "Equipment name", "e.g. Lenovo ThinkPad T14")}
      {select("category", "Category", [
        { value: "", label: "Choose a category" },
        ...categories.map((name) => ({ value: name, label: name })),
        { value: "Other", label: "Other — enter a category" },
      ])}
      {fields.category === "Other" &&
        input("customCategory", "New category", "e.g. Networking")}
      {select("location", "Primary store", [
        ...stores.map((name) => ({ value: name, label: name })),
        { value: "Other", label: "Other — enter a store" },
      ])}
      {fields.location === "Other" &&
        input("customLocation", "New primary store", "e.g. Annex equipment room")}
      <FormHint>
        Enter a new store here whenever you need one. No separate registration is
        required.
      </FormHint>
      {input("reorder", "Low-stock alert at (optional)", "e.g. 5", false, "number", 0)}
      <FormHint>
        Alert when available stock reaches this number. Leave blank to alert only when
        stock is empty.
      </FormHint>
    </>
  );
  const selected = state.equipment.find((item) => item.id === fields.equipmentId);
  const eligible = selected
    ? kind === "fault"
      ? selected.issued - selected.faulty
      : selected.available
    : 0;
  const creating = kind === "receive" && fields.equipmentId === "new";
  const isEquipment = kind === "equipment" || kind === "edit";
  const blocked =
    !isEquipment && !creating && (!selected || (kind !== "receive" && eligible === 0));
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = onSubmit(kind, fields);
    if (result) {
      setError(result);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }
  return (
    <div className="fixed [inset:0] z-50 flex justify-end">
      <button
        className="absolute [inset:0] cursor-default border-0 bg-[#1b22266b]"
        aria-label={`Close ${formTitles[kind]}`}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={cn(
          "relative z-1 flex h-dvh w-[min(460px,100vw)] flex-col bg-white shadow-[-20px_0_65px_#191f232b]",
          "animate-drawer-enter",
          "[&_form]:flex [&_form]:min-h-0 [&_form]:flex-1 [&_form]:flex-col",
          "max-[681px]:w-[min(460px,100vw)]",
          "[&_form>div:first-child]:min-h-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-title"
        aria-describedby="action-description"
      >
        <div
          className={cn(
            "flex h-16 items-center justify-between border-b border-b-line text-[10px] font-[760] tracking-[.12em]",
            "px-6.25 py-0 text-[#798994]",
          )}
        >
          <span>{kind === "edit" ? "EQUIPMENT RECORD" : "NEW RECORD"}</span>
          <button
            className={cn(
              "grid h-8.25 w-8.25 place-items-center rounded-[7px] border-0 bg-transparent text-[#697680]",
              "hover:bg-[#e8eff5] hover:text-primary",
            )}
            aria-label={`Close ${formTitles[kind]}`}
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto px-6.25 py-6.25">
            <div
              className={cn(
                "[&_h2]:mt-2.25 [&_h2]:text-[24px] [&_h2]:tracking-[-.05em]",
                "[&_p]:mt-1.75 [&_p]:text-[12px] [&_p]:leading-[1.55] [&_p]:text-[#60717c]",
                "mb-6.75",
              )}
            >
              <h2 id="action-title">{formTitles[kind]}</h2>
              <p id="action-description">
                {kind === "receive"
                  ? "Choose equipment, record how much arrived and when it was received."
                  : kind === "issue"
                    ? "Choose equipment in store, then enter who will hold it and their department."
                    : kind === "fault"
                      ? "Report a fault on issued equipment. Then track its repair in Maintenance."
                      : kind === "edit"
                        ? "Update the details used throughout the workspace."
                        : "Register an equipment type. Receive stock next to add its quantity."}
              </p>
            </div>
            {isEquipment ? (
              equipmentFields
            ) : (
              <>
                {select("equipmentId", "Equipment", [
                  { value: "", label: "Choose equipment" },
                  ...state.equipment.map((item) => ({
                    value: item.id,
                    label: `${item.name} · ${item.available + item.issued} total · ${item.available} available${kind === "fault" ? ` · ${item.issued - item.faulty} eligible for fault report` : ""}`,
                  })),
                  ...(kind === "receive"
                    ? [{ value: "new", label: "+ Register new equipment" }]
                    : []),
                ])}
                {kind === "receive" && !creating && (
                  <div
                    className={cn(
                      "mx-0 mt-0 mb-5 rounded-[8px] border border-[#dbe4eb] bg-[#f0f5f8] px-4 py-4 text-[12px] leading-[1.6]",
                      "[&_p]:mb-2 [&_p]:text-[#526573]",
                      "[&>button]:mt-1.5",
                    )}
                  >
                    <p>Equipment missing from the list?</p>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
                        "px-0 py-0.5 whitespace-nowrap",
                        "hover:text-[#37444d] hover:underline hover:underline-offset-4",
                      )}
                      onClick={() => set("equipmentId", "new")}
                    >
                      Register it with this delivery <Icon name="plus" size={15} />
                    </button>
                  </div>
                )}
                {creating && (
                  <fieldset
                    className={cn(
                      "mx-0 mt-0 mb-6 min-w-0 rounded-[8px] border border-[#dbe4eb] px-3.75 pt-4.5 pb-0",
                      "[&_legend]:px-1.5 [&_legend]:py-0 [&_legend]:text-[12px] [&_legend]:font-bold",
                      "[&>p:first-of-type]:mt-0",
                    )}
                  >
                    <legend>
                      {state.equipment.length
                        ? "Register equipment with this delivery"
                        : "Start by registering your first equipment"}
                    </legend>
                    <FormHint>
                      These details and the delivery below will be saved together.
                    </FormHint>
                    {equipmentFields}
                  </fieldset>
                )}
                {!state.equipment.length && kind !== "receive" && (
                  <div
                    className={cn(
                      "mx-0 mt-0 mb-5 rounded-[8px] border border-[#dbe4eb] bg-[#f0f5f8] px-4 py-4 text-[12px] leading-[1.6]",
                      "[&_p]:mb-2 [&_p]:text-[#526573]",
                      "[&>button]:mt-1.5",
                    )}
                  >
                    <strong>Register equipment and receive stock first</strong>
                    <p>You can add equipment while recording its first delivery.</p>
                    <Button
                      type="button"
                      onClick={() => onReceive(null)}
                      variant="secondary"
                    >
                      Receive stock <Icon name="arrow" size={15} />
                    </Button>
                  </div>
                )}
                {selected && (
                  <div
                    className={cn(
                      "flex flex-wrap gap-[8px_16px] px-0 pt-3 pb-5 text-[11px] text-[#526573]",
                      "[&_strong]:text-ink [&_strong]:tabular-nums",
                    )}
                    aria-live="polite"
                  >
                    <span>
                      <strong>{selected.available}</strong> available
                    </span>
                    <span>
                      <strong>{selected.issued}</strong> issued
                    </span>
                    <span>
                      <strong>{selected.faulty}</strong> under maintenance
                    </span>
                  </div>
                )}
                {selected && kind === "issue" && eligible === 0 && (
                  <div
                    className={cn(
                      "mx-0 mt-0 mb-5 rounded-[8px] border border-[#dbe4eb] bg-[#f0f5f8] px-4 py-4 text-[12px] leading-[1.6]",
                      "[&_p]:mb-2 [&_p]:text-[#526573]",
                      "[&>button]:mt-1.5",
                    )}
                  >
                    <strong>No stock available to issue</strong>
                    <p>Record a delivery for this equipment before assigning units.</p>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
                        "px-0 py-0.5 whitespace-nowrap",
                        "hover:text-[#37444d] hover:underline hover:underline-offset-4",
                      )}
                      onClick={() => onReceive(selected.id)}
                    >
                      Receive this equipment <Icon name="arrow" size={15} />
                    </button>
                  </div>
                )}
                {selected && kind === "fault" && (
                  <FormHint>
                    {eligible} issued units can be reported. Units already under
                    maintenance are excluded.
                    {eligible === 0
                      ? " Check existing cases in Maintenance, or choose other issued equipment."
                      : ""}
                  </FormHint>
                )}
                {(!blocked || selected) && (
                  <>
                    {input(
                      "quantity",
                      kind === "fault" ? "Units affected" : "Quantity",
                      "Number of units",
                      true,
                      "number",
                      1,
                      kind === "receive" ? undefined : eligible,
                    )}
                    {kind === "receive" && (
                      <>
                        {input(
                          "supplier",
                          "Supplier or source",
                          "e.g. Supplier name or donation",
                        )}
                        {input(
                          "receivedAt",
                          "Date and time received",
                          "",
                          true,
                          "datetime-local",
                          undefined,
                          localDateTime(),
                        )}
                        <FormHint>
                          Lagos time (WAT). Choose when the equipment actually arrived.
                        </FormHint>
                      </>
                    )}
                    {kind === "issue" && (
                      <>
                        {input("assignee", "Custodian", "Full name")}
                        {input(
                          "department",
                          "Department / location",
                          "e.g. Operations, main office",
                        )}
                      </>
                    )}
                    {kind === "fault" && (
                      <>
                        {input("title", "Fault description", "Describe what is wrong")}
                        {select(
                          "priority",
                          "Priority",
                          ["Low", "Medium", "High"].map((name) => ({
                            value: name,
                            label: name,
                          })),
                        )}
                        {input(
                          "location",
                          "Current location",
                          "e.g. Control room, first floor",
                        )}
                        {input("custodian", "Current custodian", "Full name or team")}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                className={cn(
                  "flex items-start gap-2 rounded-[7px] border border-[#f3d5cb] bg-[#fbeeea] px-2.75 text-[11px] text-[#a45e4c]",
                  "mx-0 my-2.5 py-2.75",
                )}
                role="alert"
              >
                <Icon name="alert" size={17} />
                {error}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex justify-end gap-2.25 border-t border-t-line bg-white px-6.25 py-4",
              "[&>button]:flex-1",
            )}
          >
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={blocked} variant="primary">
              {kind === "edit"
                ? "Save changes"
                : kind === "receive"
                  ? creating
                    ? "Register & receive stock"
                    : "Receive stock"
                  : kind === "equipment"
                    ? "Add equipment"
                    : kind === "issue"
                      ? "Issue equipment"
                      : "Report fault"}
              <Icon name="arrow" size={16} />
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
