"use client";

import { Icon } from "../ui/icons";
import { EquipmentTable } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "available" | "lowStock" | "query" | "setQuery" | "page" | "setPage" | "category" | "setCategory" | "stockFilter" | "setStockFilter" | "categories" | "visibleEquipment" | "filteredEquipment" | "pageCount" | "setDetail" | "setForm">;

export function InventoryView({ state, available, lowStock, query, setQuery, page, setPage, category, setCategory, stockFilter, setStockFilter, categories, visibleEquipment, filteredEquipment, pageCount, setDetail, setForm }: Props) {
  return (
<>
              <div className="inline-summary">
                <span>
                  <strong>{state.equipment.length}</strong> equipment types
                </span>
                <span className="separator" />
                <span>
                  <strong>{available}</strong> available in store
                </span>
                <span className="separator" />
                <span>
                  <strong>{lowStock.length}</strong> low on stock
                </span>
              </div>
              <div className="toolbar">
                <div className="toolbar-search">
                  <Icon name="search" size={18} />
                  <input
                    aria-label="Search inventory"
                    placeholder="Search the inventory..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <label className="select-wrap">
                  <Icon name="filter" size={17} />
                  <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="select-wrap">
                  <select
                    aria-label="Filter by stock status"
                    value={stockFilter}
                    onChange={(e) => {
                      setStockFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option>All stock</option>
                    <option>Low stock</option>
                    <option>Has faults</option>
                  </select>
                </label>
              </div>
              {!state.equipment.length && <div className="form-guidance"><strong>Start your equipment register</strong><p>Add an equipment type, or register it while receiving its first delivery.</p><button className="button secondary" onClick={() => setForm("receive")}>Receive your first stock <Icon name="arrow" size={16} /></button></div>}
              {state.equipment.length > 0 && <>
              <EquipmentTable
                items={visibleEquipment}
                onSelect={setDetail}
                empty={filteredEquipment.length === 0}
              />
              <div className="table-footer">
                <span>
                  Showing{" "}
                  {filteredEquipment.length === 0 ? 0 : (page - 1) * 6 + 1}â€“
                  {Math.min(page * 6, filteredEquipment.length)} of{" "}
                  {filteredEquipment.length} equipment types
                </span>
                <div>
                  <button
                    className="button secondary compact"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="page-number">
                    {page} / {pageCount}
                  </span>
                  <button
                    className="button secondary compact"
                    disabled={page >= pageCount}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
              </>}
              <p className="help-note">
                <Icon name="alert" size={16} /> Faulty units are counted within
                their current custody, not added to total held.
              </p>
            </>
  );
}

