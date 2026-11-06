"use client";

import { cn } from "@/app/lib/cn";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Fault, InventoryState } from "../lib/demo-data";
import type { RepairDetails } from "../lib/inventory-actions";
import { formTitles, headings, type FormKind, type View } from "../lib/workspace-config";
import { sum } from "../lib/workspace-utils";
import { useInventoryData } from "../hooks/use-inventory-data";
import { ActionPanel } from "./drawers/action-panel";
import { DetailPanel } from "./drawers/detail-panel";
import { PageHeading } from "./layout/page-heading";
import { Sidebar } from "./layout/sidebar";
import { Topbar } from "./layout/topbar";
import { Icon } from "./ui/icons";
import { InventoryView } from "./views/inventory-view";
import { IssuesView } from "./views/issues-view";
import { MaintenanceView } from "./views/maintenance-view";
import { MovementsView } from "./views/movements-view";
import { OverviewView } from "./views/overview-view";
import { ReceiptsView } from "./views/receipts-view";
import { ReportsView } from "./views/reports-view";
import { TeamSettingsView } from "./views/team-settings-view";
import type { WorkspaceViewProps } from "./views/view-props";

export default function InventoryWorkspace({
  initialState,
}: {
  initialState: InventoryState;
}) {
  const {
    state,
    ready,
    syncError,
    submitForm,
    updateFault,
    exportInventory,
    exportMovements,
  } = useInventoryData(initialState);
  const [view, setView] = useState<View>("overview");
  const [form, setForm] = useState<FormKind | null>(null);
  const [formEquipmentId, setFormEquipmentId] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [stockFilter, setStockFilter] = useState("All stock");
  const [page, setPage] = useState(1);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const syncView = () => {
      const next = location.hash.slice(1) as View;
      setView(headings[next] ? next : "overview");
    };
    syncView();
    window.addEventListener("popstate", syncView);
    window.addEventListener("hashchange", syncView);
    return () => {
      window.removeEventListener("popstate", syncView);
      window.removeEventListener("hashchange", syncView);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setForm(null);
        setFormEquipmentId(null);
        setDetail(null);
        setMobileNav(false);
        setNotifications(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const navigate = (target: View) => {
    setView(target);
    setMobileNav(false);
    setPage(1);
    setQuery("");
    window.history.pushState(null, "", `#${target}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const held = sum(state.equipment.map((item) => item.available + item.issued));
  const available = sum(state.equipment.map((item) => item.available));
  const issued = sum(state.equipment.map((item) => item.issued));
  const faulty = sum(state.equipment.map((item) => item.faulty));
  const lowStock = state.equipment.filter((item) => item.available <= item.reorder);
  const openFaults = state.faults.filter((fault) => fault.status !== "Resolved");
  const categories = [
    "All categories",
    ...new Set(state.equipment.map((item) => item.category)),
  ];
  const filteredEquipment = useMemo(
    () =>
      state.equipment.filter((item) => {
        const matchesQuery = `${item.name} ${item.id} ${item.category} ${item.location}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory =
          category === "All categories" || item.category === category;
        const matchesStock =
          stockFilter === "All stock" ||
          (stockFilter === "Low stock"
            ? item.available <= item.reorder
            : item.faulty > 0);
        return matchesQuery && matchesCategory && matchesStock;
      }),
    [state.equipment, query, category, stockFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredEquipment.length / 6));
  const visibleEquipment = filteredEquipment.slice((page - 1) * 6, page * 6);
  const selected = state.equipment.find((item) => item.id === detail);
  const handleSubmit = async (kind: FormKind, fields: Record<string, string>) => {
    const error = await submitForm(kind, fields);
    if (!error) {
      setForm(null);
      setFormEquipmentId(null);
      setToast(
        kind === "edit"
          ? "Equipment updated"
          : kind === "equipment"
            ? "Equipment added"
            : `${formTitles[kind]} recorded successfully`,
      );
    }
    return error;
  };
  const handleUpdateFault = async (
    fault: Fault,
    status: Fault["status"],
    details?: RepairDetails,
  ) => {
    const error = await updateFault(fault, status, details);
    if (error) return error;
    setToast(
      status === "Resolved" ? "Repair marked complete" : "Maintenance progress updated",
    );
    return null;
  };
  const handleExportInventory = () => {
    exportInventory();
    setToast("Inventory CSV downloaded");
  };
  const handleExportMovements = () => {
    exportMovements();
    setToast("Movement CSV downloaded");
  };
  const viewProps: WorkspaceViewProps = {
    state,
    held,
    available,
    issued,
    faulty,
    lowStock,
    openFaults,
    categories,
    filteredEquipment,
    visibleEquipment,
    page,
    pageCount,
    query,
    category,
    stockFilter,
    setQuery,
    setCategory,
    setStockFilter,
    setPage,
    navigate,
    setForm,
    setDetail,
    updateFault: handleUpdateFault,
  };
  if (!ready)
    return (
      <main
        className="grid min-h-dvh place-items-center text-[14px] text-[#526573]"
        role="status"
      >
        Loading your inventory…
      </main>
    );
  return (
    <div className="min-h-dvh">
      <Sidebar
        view={view}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        navigate={navigate}
        openFaultCount={openFaults.length}
      />
      <div
        className={cn(
          "ml-62.5 min-h-dvh min-w-0",
          "max-[1181px]:ml-55",
          "max-[921px]:ml-0",
        )}
      >
        <Topbar
          view={view}
          setView={setView}
          navigate={navigate}
          query={query}
          setQuery={setQuery}
          setPage={setPage}
          setMobileNav={setMobileNav}
          searchRef={searchRef}
          notifications={notifications}
          setNotifications={setNotifications}
          faulty={faulty}
          lowStockCount={lowStock.length}
        />
        <main
          className={cn(
            "mx-auto my-0 max-w-367.5 px-9.75 pt-9.5 pb-20",
            "max-[1181px]:px-6.5 max-[1181px]:pt-8 max-[1181px]:pb-17.5",
            "max-[921px]:px-6.25 max-[921px]:pt-7.5 max-[921px]:pb-16.25",
            "max-md:px-4.25 max-md:pt-6.5 max-md:pb-13.75",
          )}
        >
          <PageHeading
            view={view}
            setForm={setForm}
            exportInventory={handleExportInventory}
            exportMovements={handleExportMovements}
          />
          {syncError && (
            <p
              role="alert"
              className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            >
              {syncError}
            </p>
          )}
          {view === "overview" && <OverviewView {...viewProps} />}
          {view === "inventory" && <InventoryView {...viewProps} />}
          {view === "receipts" && <ReceiptsView {...viewProps} />}
          {view === "issues" && <IssuesView {...viewProps} />}
          {view === "maintenance" && <MaintenanceView {...viewProps} />}
          {view === "movements" && <MovementsView {...viewProps} />}
          {view === "reports" && <ReportsView {...viewProps} />}
          {view === "settings" && <TeamSettingsView />}
        </main>
      </div>
      {selected && (
        <DetailPanel
          item={selected}
          movements={state.movements.filter(
            (movement) => movement.equipmentId === selected.id,
          )}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setDetail(null);
            setFormEquipmentId(selected.id);
            setForm("edit");
          }}
          onIssue={() => {
            setDetail(null);
            setFormEquipmentId(selected.id);
            setForm("issue");
          }}
          onReceive={() => {
            setDetail(null);
            setFormEquipmentId(selected.id);
            setForm("receive");
          }}
        />
      )}
      {form && (
        <ActionPanel
          key={`${form}-${formEquipmentId || "new"}`}
          kind={form}
          state={state}
          initialEquipmentId={formEquipmentId}
          onClose={() => {
            setForm(null);
            setFormEquipmentId(null);
          }}
          onSubmit={handleSubmit}
          onReceive={(equipmentId) => {
            setFormEquipmentId(equipmentId);
            setForm("receive");
          }}
        />
      )}
      {toast && (
        <div
          className={cn(
            "fixed right-6.5 bottom-6.25 z-80 flex items-center gap-2.75 rounded-[9px] bg-[#2a343b] text-white",
            "animate-toast-enter py-2.5 pr-2.75 pl-2.5 text-[11.5px] font-[650] shadow-[0_12px_35px_#1f262b36]",
            "[&>span]:grid [&>span]:h-6.25 [&>span]:w-6.25 [&>span]:rounded-[6px] [&>span]:bg-[#58636b]",
            "[&>span]:place-items-center",
            "[&_button]:ml-1.5 [&_button]:grid [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[#c7ced3]",
            "[&_button]:place-items-center",
            "max-md:right-3.75 max-md:bottom-3.5 max-md:left-3.75",
          )}
          role="status"
        >
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
