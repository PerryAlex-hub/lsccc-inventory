"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { initialState, type Fault } from "../lib/demo-data";
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
import { LocationsView } from "./views/locations-view";
import { MaintenanceView } from "./views/maintenance-view";
import { MovementsView } from "./views/movements-view";
import { OverviewView } from "./views/overview-view";
import { ReceiptsView } from "./views/receipts-view";
import { ReportsView } from "./views/reports-view";
import { SettingsView } from "./views/settings-view";
import type { WorkspaceViewProps } from "./views/view-props";

export default function InventoryWorkspace() {
  const { state, setState, submitForm, updateFault, exportInventory, exportMovements } = useInventoryData();
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
  const categories = ["All categories", ...new Set(state.equipment.map((item) => item.category))];
  const filteredEquipment = useMemo(() => state.equipment.filter((item) => {
    const matchesQuery = `${item.name} ${item.id} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || item.category === category;
    const matchesStock = stockFilter === "All stock" || (stockFilter === "Low stock" ? item.available <= item.reorder : item.faulty > 0);
    return matchesQuery && matchesCategory && matchesStock;
  }), [state.equipment, query, category, stockFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredEquipment.length / 6));
  const visibleEquipment = filteredEquipment.slice((page - 1) * 6, page * 6);
  const selected = state.equipment.find((item) => item.id === detail);

  const handleSubmit = (kind: FormKind, fields: Record<string, string>) => {
    const error = submitForm(kind, fields);
    if (!error) {
      setForm(null);
      setFormEquipmentId(null);
      setToast(kind === "edit" ? "Equipment updated" : kind === "equipment" ? "Equipment added" : kind === "location" ? "Location added" : `${formTitles[kind]} recorded successfully`);
    }
    return error;
  };
  const handleUpdateFault = (fault: Fault, status: Fault["status"]) => {
    updateFault(fault, status);
    setToast(status === "Resolved" ? "Repair marked complete" : "Maintenance progress updated");
  };
  const handleExportInventory = () => { exportInventory(); setToast("Inventory CSV downloaded"); };
  const handleExportMovements = () => { exportMovements(); setToast("Movement CSV downloaded"); };

  const viewProps: WorkspaceViewProps = {
    state, held, available, issued, faulty, lowStock, openFaults, categories,
    filteredEquipment, visibleEquipment, page, pageCount, query, category,
    stockFilter, setQuery, setCategory, setStockFilter, setPage, navigate,
    setForm, setDetail, updateFault: handleUpdateFault,
    resetData: () => { setState(initialState); setToast("Demo data restored"); },
  };

  return (
    <div className="app-shell">
      <Sidebar view={view} mobileNav={mobileNav} setMobileNav={setMobileNav} navigate={navigate} openFaultCount={openFaults.length} />
      <div className="workspace">
        <Topbar view={view} setView={setView} navigate={navigate} query={query} setQuery={setQuery} setPage={setPage} setMobileNav={setMobileNav} searchRef={searchRef} notifications={notifications} setNotifications={setNotifications} openFaultCount={openFaults.length} faulty={faulty} lowStockCount={lowStock.length} />
        <main className="main-content">
          <PageHeading view={view} setForm={setForm} exportInventory={handleExportInventory} exportMovements={handleExportMovements} />
          {view === "overview" && <OverviewView {...viewProps} />}
          {view === "inventory" && <InventoryView {...viewProps} />}
          {view === "receipts" && <ReceiptsView {...viewProps} />}
          {view === "issues" && <IssuesView {...viewProps} />}
          {view === "maintenance" && <MaintenanceView {...viewProps} />}
          {view === "locations" && <LocationsView {...viewProps} />}
          {view === "movements" && <MovementsView {...viewProps} />}
          {view === "reports" && <ReportsView {...viewProps} />}
          {view === "settings" && <SettingsView {...viewProps} />}
        </main>
      </div>
      {selected && (
        <DetailPanel
          item={selected}
          movements={state.movements.filter((movement) => movement.equipmentId === selected.id)}
          onClose={() => setDetail(null)}
          onEdit={() => { setDetail(null); setFormEquipmentId(selected.id); setForm("edit"); }}
          onIssue={() => { setDetail(null); setFormEquipmentId(selected.id); setForm("issue"); }}
          onReceive={() => { setDetail(null); setFormEquipmentId(selected.id); setForm("receive"); }}
        />
      )}
      {form && (
        <ActionPanel kind={form} state={state} initialEquipmentId={formEquipmentId}
          onClose={() => { setForm(null); setFormEquipmentId(null); }} onSubmit={handleSubmit} />
      )}
      {toast && (
        <div className="toast" role="status">
          <span><Icon name="check" size={17} /></span>
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}><Icon name="close" size={16} /></button>
        </div>
      )}
    </div>
  );
}

