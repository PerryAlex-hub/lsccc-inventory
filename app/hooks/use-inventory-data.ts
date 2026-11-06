"use client";

import { useEffect, useState } from "react";
import {
  equipmentName,
  formatDate,
  initialState,
  nextId,
  type Equipment,
  type Fault,
  type InventoryState,
  type Movement,
  type MovementType,
} from "../lib/demo-data";
import type { FormKind } from "../lib/workspace-config";
import { downloadCsv, today } from "../lib/workspace-utils";

const STORAGE_KEY = "lsccc-inventory-v1";

export function useInventoryData() {
  const [state, setState] = useState<InventoryState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setState(JSON.parse(saved) as InventoryState);
      } catch {
        /* A fresh workspace is safe if local storage is unavailable. */
      }
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Local data remains usable for this session. */
    }
  }, [state, ready]);

  const addMovement = (
    current: InventoryState,
    type: MovementType,
    equipmentId: string,
    quantity: number,
    description: string,
  ): Movement => ({
    id: nextId("MOV", current.movements),
    type,
    equipmentId,
    quantity,
    description,
    date: today(),
    actor: "Admin Officer",
  });

  function submitForm(kind: FormKind, fields: Record<string, string>) {
    const equipmentId = fields.equipmentId || state.equipment[0]?.id;
    const item = state.equipment.find((e) => e.id === equipmentId);
    const qty = Number(fields.quantity);
    if (kind !== "equipment" && kind !== "location" && !item)
      return "Choose an equipment type.";
    if (
      ["receive", "issue", "return", "fault", "adjust"].includes(kind) &&
      (!Number.isInteger(qty) || qty < (kind === "adjust" ? -99999 : 1))
    )
      return "Enter a valid whole quantity.";
    if (kind === "adjust" && qty === 0)
      return "Enter a non-zero stock change.";
    if (kind === "stocktake" && (!Number.isInteger(qty) || qty < 0))
      return "Enter a non-negative whole quantity.";
    if (kind === "issue" && item && qty > item.available)
      return `Only ${item.available} units are available to issue.`;
    if (kind === "fault" && item && qty > item.issued - item.faulty)
      return "Only issued units that are not already faulty can be reported here.";
    if (kind === "adjust" && item && item.available + qty < 0)
      return "This adjustment would make available stock negative.";
    if (kind === "transfer" && (!Number.isInteger(qty) || qty < 1))
      return "Enter a valid whole quantity.";
    if (kind === "transfer" && fields.from === fields.to)
      return "Choose two different locations for the transfer.";
    if (kind === "return") {
      const issue = state.issues.find((entry) => entry.id === fields.issueId);
      if (!issue) return "Choose an issue to return against.";
      if (qty > issue.quantity - issue.returned)
        return "The return quantity exceeds the outstanding issue.";
      if (issue.equipmentId !== equipmentId)
        return "The equipment must match the selected issue.";
    }
    if (
      kind === "equipment" &&
      state.equipment.some(
        (e) => e.name.toLowerCase() === fields.name?.trim().toLowerCase(),
      )
    )
      return "This equipment type already exists.";
    if (
      kind === "edit" &&
      state.equipment.some(
        (e) =>
          e.id !== equipmentId &&
          e.name.toLowerCase() === fields.name?.trim().toLowerCase(),
      )
    )
      return "This equipment name is already in use.";
    if (
      (kind === "edit" || kind === "equipment") &&
      (!Number.isInteger(Number(fields.reorder || 0)) ||
        Number(fields.reorder || 0) < 0)
    )
      return "Low-stock alert level must be a non-negative whole number.";
    if (
      kind === "location" &&
      state.locations.some(
        (l) => l.name.toLowerCase() === fields.name?.trim().toLowerCase(),
      )
    )
      return "This location already exists.";
    setState((current) => {
      const date = today();
      const update = (change: (e: Equipment) => Equipment) =>
        current.equipment.map((e) => (e.id === equipmentId ? change(e) : e));
      if (kind === "equipment")
        return {
          ...current,
          equipment: [
            ...current.equipment,
            {
              id: nextId("EQ", current.equipment),
              name: fields.name.trim(),
              category: fields.category || "Other",
              available: 0,
              issued: 0,
              faulty: 0,
              location: fields.location || "Equipment store",
              reorder: Number(fields.reorder) || 0,
            },
          ],
        };
      if (kind === "edit")
        return {
          ...current,
          equipment: update((e) => ({
            ...e,
            name: fields.name.trim(),
            category: fields.category,
            location: fields.location,
            reorder: Number(fields.reorder) || 0,
          })),
        };
      if (kind === "location")
        return {
          ...current,
          locations: [
            ...current.locations,
            {
              id: nextId("LOC", current.locations),
              name: fields.name.trim(),
              kind: fields.kind || "Department",
              lead: fields.lead || "Unassigned",
            },
          ],
        };
      if (kind === "receive")
        return {
          ...current,
          equipment: update((e) => ({ ...e, available: e.available + qty })),
          receipts: [
            {
              id: nextId("REC", current.receipts),
              equipmentId,
              quantity: qty,
              supplier: fields.supplier.trim(),
              reference: fields.reference.trim(),
              date,
            },
            ...current.receipts,
          ],
          movements: [
            addMovement(
              current,
              "Receipt",
              equipmentId,
              qty,
              `Received from ${fields.supplier.trim()} · Equipment store`,
            ),
            ...current.movements,
          ],
        };
      if (kind === "issue")
        return {
          ...current,
          equipment: update((e) => ({
            ...e,
            available: e.available - qty,
            issued: e.issued + qty,
          })),
          issues: [
            {
              id: nextId("ISS", current.issues),
              equipmentId,
              quantity: qty,
              returned: 0,
              assignee: fields.assignee.trim(),
              department: fields.department.trim(),
              date,
            },
            ...current.issues,
          ],
          movements: [
            addMovement(
              current,
              "Issue",
              equipmentId,
              qty,
              `Issued to ${fields.department.trim()} · ${fields.assignee.trim()}`,
            ),
            ...current.movements,
          ],
        };
      if (kind === "return")
        return {
          ...current,
          equipment: update((e) => ({
            ...e,
            available: e.available + qty,
            issued: e.issued - qty,
          })),
          issues: current.issues.map((issue) =>
            issue.id === fields.issueId
              ? { ...issue, returned: issue.returned + qty }
              : issue,
          ),
          movements: [
            addMovement(
              current,
              "Return",
              equipmentId,
              qty,
              `Returned by ${fields.department || "staff"} · ${fields.condition || "Good condition"}`,
            ),
            ...current.movements,
          ],
        };
      if (kind === "fault")
        return {
          ...current,
          equipment: update((e) => ({ ...e, faulty: e.faulty + qty })),
          faults: [
            {
              id: nextId("MNT", current.faults),
              equipmentId,
              quantity: qty,
              title: fields.title.trim(),
              location: fields.location.trim(),
              custodian: fields.custodian.trim(),
              priority: (fields.priority || "Medium") as Fault["priority"],
              status: "Reported",
              date,
            },
            ...current.faults,
          ],
          movements: [
            addMovement(
              current,
              "Fault",
              equipmentId,
              qty,
              `${fields.title.trim()} · ${fields.location.trim()}`,
            ),
            ...current.movements,
          ],
        };
      if (kind === "adjust")
        return {
          ...current,
          equipment: update((e) => ({ ...e, available: e.available + qty })),
          movements: [
            addMovement(
              current,
              "Adjustment",
              equipmentId,
              qty,
              `Stock adjustment · ${fields.reason.trim()}`,
            ),
            ...current.movements,
          ],
        };
      if (kind === "stocktake")
        return {
          ...current,
          equipment: update((e) => ({ ...e, available: qty })),
          movements: [
            addMovement(
              current,
              "Stocktake",
              equipmentId,
              qty - (item?.available || 0),
              `Counted ${qty} available · ${fields.reason.trim()}`,
            ),
            ...current.movements,
          ],
        };
      return {
        ...current,
        movements: [
          addMovement(
            current,
            "Transfer",
            equipmentId,
            Number(fields.quantity) || 1,
            `Transferred from ${fields.from} to ${fields.to}`,
          ),
          ...current.movements,
        ],
      };
    });
    return null;
  }

  function updateFault(fault: Fault, status: Fault["status"]) {
    setState((current) => ({
      ...current,
      faults: current.faults.map((f) =>
        f.id === fault.id ? { ...f, status } : f,
      ),
      equipment:
        status === "Resolved"
          ? current.equipment.map((e) =>
              e.id === fault.equipmentId
                ? { ...e, faulty: Math.max(0, e.faulty - fault.quantity) }
                : e,
            )
          : current.equipment,
      movements:
        status === "Resolved"
          ? [
              addMovement(
                current,
                "Repair",
                fault.equipmentId,
                fault.quantity,
                `Repair completed · ${fault.title}`,
              ),
              ...current.movements,
            ]
          : current.movements,
    }));
  }

  const exportInventory = () => {
    downloadCsv("lsccc-inventory.csv", [
      [
        "ID",
        "Equipment",
        "Category",
        "Total held",
        "Available",
        "Issued",
        "Faulty",
      ],
      ...state.equipment.map((e) => [
        e.id,
        e.name,
        e.category,
        e.available + e.issued,
        e.available,
        e.issued,
        e.faulty,
      ]),
    ]);
  };
  const exportMovements = () => {
    downloadCsv("lsccc-movements.csv", [
      [
        "Reference",
        "Date",
        "Type",
        "Equipment",
        "Quantity",
        "Description",
        "Recorded by",
      ],
      ...state.movements.map((m) => [
        m.id,
        formatDate(m.date),
        m.type,
        equipmentName(state.equipment, m.equipmentId),
        m.quantity,
        m.description,
        m.actor,
      ]),
    ]);
  };

  return { state, setState, submitForm, updateFault, exportInventory, exportMovements };
}
