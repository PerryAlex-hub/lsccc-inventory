"use client";

import { useEffect, useRef, useState } from "react";
import { equipmentName, initialState, type Fault, type InventoryState } from "../lib/demo-data";
import { applyInventoryForm, transitionFault, type RepairDetails } from "../lib/inventory-actions";
import type { FormKind } from "../lib/workspace-config";
import { downloadCsv, formatDateTime } from "../lib/workspace-utils";

const STORAGE_KEY = "lsccc-inventory-v1";

export function useInventoryData() {
  const [state, setState] = useState<InventoryState>(initialState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const restored = JSON.parse(saved) as InventoryState;
          stateRef.current = restored;
          setState(restored);
        }
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

  function commit(result: { state: InventoryState; error: string | null }) {
    if (!result.error) {
      stateRef.current = result.state;
      setState(result.state);
    }
    return result.error;
  }

  function submitForm(kind: FormKind, fields: Record<string, string>) {
    return commit(applyInventoryForm(stateRef.current, kind, fields));
  }

  function updateFault(fault: Fault, status: Fault["status"], details?: RepairDetails) {
    return commit(transitionFault(stateRef.current, fault.id, status, details));
  }

  const exportInventory = () => {
    downloadCsv("lsccc-inventory.csv", [
      ["ID", "Equipment", "Category", "Primary store", "Total held", "Available", "Issued", "Faulty"],
      ...state.equipment.map((e) => [e.id, e.name, e.category, e.location, e.available + e.issued, e.available, e.issued, e.faulty]),
    ]);
  };
  const exportMovements = () => {
    downloadCsv("lsccc-movements.csv", [
      ["Reference", "Date and time (Lagos)", "Type", "Equipment", "Quantity", "Description", "Recorded by"],
      ...state.movements.map((m) => [m.id, formatDateTime(m.date), m.type, equipmentName(state.equipment, m.equipmentId), m.quantity, m.description, m.actor]),
    ]);
  };

  return { state, ready, submitForm, updateFault, exportInventory, exportMovements };
}
