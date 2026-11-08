"use client";

import { useEffect, useRef, useState } from "react";
import { equipmentName, type Fault, type InventoryState } from "../lib/demo-data";
import type { RepairDetails } from "../lib/inventory-actions";
import type { RecordRequest } from "../lib/record-actions";
import { apiRequest } from "../lib/api-client";
import type { FormKind } from "../lib/workspace-config";
import { downloadCsv, formatDateTime } from "../lib/workspace-utils";

export function useInventoryData(initialState: InventoryState) {
  const [state, setState] = useState<InventoryState>(initialState);
  const [syncError, setSyncError] = useState("");
  const saving = useRef(false);
  const version = useRef(0);
  const retry = useRef<{ payload: string; key: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      if (document.visibilityState !== "visible" || saving.current) return;
      const requestVersion = ++version.current;
      try {
        const result = await apiRequest<{ state: InventoryState }>("/api/inventory", {
          signal: controller.signal,
        });
        if (version.current === requestVersion && !saving.current) {
          setState(result.state);
          setSyncError("");
        }
      } catch {
        if (!controller.signal.aborted)
          setSyncError(
            "The shared records could not be refreshed. Check your connection; saving still requires the server.",
          );
      }
    }
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  async function commit(body: unknown) {
    if (saving.current) return "Another change is being saved. Please wait.";
    saving.current = true;
    version.current += 1;
    const payload = JSON.stringify(body);
    const key =
      retry.current?.payload === payload ? retry.current.key : crypto.randomUUID();
    retry.current = { payload, key };
    try {
      const result = await apiRequest<{ state: InventoryState }>("/api/inventory", {
        method: "POST",
        body,
        requestKey: key,
      });
      setState(result.state);
      retry.current = null;
      setSyncError("");
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Couldn’t save this change. Try again.";
    } finally {
      saving.current = false;
      version.current += 1;
    }
  }

  function submitForm(kind: FormKind, fields: Record<string, string>) {
    return commit({ kind, fields });
  }

  function updateFault(fault: Fault, status: Fault["status"], details?: RepairDetails) {
    return commit({ action: "maintenance", id: fault.id, status, details });
  }

  function updateRecord(request: RecordRequest) {
    return commit({
      action: request.action,
      collection: request.collection,
      id: request.id,
      confirmation: request.id,
    });
  }

  const exportInventory = () => {
    downloadCsv("lsccc-inventory.csv", [
      [
        "ID",
        "Equipment",
        "Category",
        "Primary store",
        "Total held",
        "Available",
        "Issued",
        "Faulty",
        "Record status",
      ],
      ...state.equipment.map((e) => [
        e.id,
        e.name,
        e.category,
        e.location,
        e.available + e.issued,
        e.available,
        e.issued,
        e.faulty,
        e.archivedAt ? "Archived" : "Active",
      ]),
    ]);
  };
  const exportMovements = () => {
    downloadCsv("lsccc-movements.csv", [
      [
        "Reference",
        "Date and time (Lagos)",
        "Type",
        "Equipment",
        "Quantity",
        "Description",
        "Recorded by",
        "Record status",
      ],
      ...state.movements.map((m) => [
        m.id,
        formatDateTime(m.date),
        m.type,
        equipmentName(state.equipment, m.equipmentId),
        m.quantity,
        m.description,
        m.actor,
        m.archivedAt ? "Archived" : "Active",
      ]),
    ]);
  };

  return {
    state,
    ready: true,
    syncError,
    submitForm,
    updateFault,
    updateRecord,
    exportInventory,
    exportMovements,
  };
}
