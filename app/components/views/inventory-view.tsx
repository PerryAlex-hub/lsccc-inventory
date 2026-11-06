"use client";

import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Icon } from "../ui/icons";
import { EquipmentTable } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<
  WorkspaceViewProps,
  | "state"
  | "available"
  | "lowStock"
  | "query"
  | "setQuery"
  | "page"
  | "setPage"
  | "category"
  | "setCategory"
  | "stockFilter"
  | "setStockFilter"
  | "categories"
  | "visibleEquipment"
  | "filteredEquipment"
  | "pageCount"
  | "setDetail"
  | "setForm"
>;

export function InventoryView({
  state,
  available,
  lowStock,
  query,
  setQuery,
  page,
  setPage,
  category,
  setCategory,
  stockFilter,
  setStockFilter,
  categories,
  visibleEquipment,
  filteredEquipment,
  pageCount,
  setDetail,
  setForm,
}: Props) {
  return (
    <>
      <div
        className={cn(
          "mx-0 -mt-1 mb-5.5 flex items-center gap-4.25 text-[11.5px] text-[#768590]",
          "[&_strong]:text-[13px] [&_strong]:text-[#303a42]",
          "max-[681px]:flex-wrap max-[681px]:gap-[8px_12px]",
        )}
      >
        <span>
          <strong>{state.equipment.length}</strong> equipment types
        </span>
        <span className="h-4 w-px bg-[#d3dadf]" />
        <span>
          <strong>{available}</strong> available in store
        </span>
        <span className="h-4 w-px bg-[#d3dadf]" />
        <span>
          <strong>{lowStock.length}</strong> low on stock
        </span>
      </div>
      <div
        className={cn(
          "mb-3.75 flex flex-wrap items-center gap-2.25",
          "max-[681px]:[&>label]:flex-1",
        )}
      >
        <div
          className={cn(
            "flex h-9.5 min-w-65 flex-1 items-center gap-2.25 rounded-[7px] border border-[#dbe3e8] bg-white text-[#7d8d99]",
            "px-2.75 py-0",
            "[&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0 [&_input]:text-ink [&_input]:outline-none",
            "[&_input]:text-[11.5px]",
            "max-[681px]:[flex-basis:100%]",
            "[&_input::placeholder]:text-[#8b9daa]",
          )}
        >
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
        <label
          className={cn(
            "flex h-9.5 items-center gap-1.25 rounded-[7px] border border-[#dbe3e8] bg-white px-2.5 py-0 text-[#74838e]",
            "[&_select]:border-0 [&_select]:bg-transparent [&_select]:text-[#475662] [&_select]:outline-none",
            "[&_select]:min-w-25.75 [&_select]:text-[11px]",
          )}
        >
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
        <label
          className={cn(
            "flex h-9.5 items-center gap-1.25 rounded-[7px] border border-[#dbe3e8] bg-white px-2.5 py-0 text-[#74838e]",
            "[&_select]:border-0 [&_select]:bg-transparent [&_select]:text-[#475662] [&_select]:outline-none",
            "[&_select]:min-w-25.75 [&_select]:text-[11px]",
          )}
        >
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
      {!state.equipment.length && (
        <div
          className={cn(
            "mx-0 mt-0 mb-5 rounded-[8px] border border-[#dbe4eb] bg-[#f0f5f8] px-4 py-4 text-[12px] leading-[1.6]",
            "[&_p]:mb-2 [&_p]:text-[#526573]",
            "[&>button]:mt-1.5",
          )}
        >
          <strong>Start your equipment register</strong>
          <p>Add an equipment type, or register it while receiving its first delivery.</p>
          <Button onClick={() => setForm("receive")} variant="secondary">
            Receive your first stock <Icon name="arrow" size={16} />
          </Button>
        </div>
      )}
      {state.equipment.length > 0 && (
        <>
          <EquipmentTable
            items={visibleEquipment}
            onSelect={setDetail}
            empty={filteredEquipment.length === 0}
          />
          <div
            className={cn(
              "mt-3 flex items-center justify-between gap-2.5 text-[10.5px] text-[#8394a0]",
              "[&>div]:flex [&>div]:items-center [&>div]:gap-2.25",
              "max-[681px]:flex-col max-[681px]:items-start",
            )}
          >
            <span>
              Showing {filteredEquipment.length === 0 ? 0 : (page - 1) * 6 + 1}â€“
              {Math.min(page * 6, filteredEquipment.length)} of {filteredEquipment.length}{" "}
              equipment types
            </span>
            <div>
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                variant="secondary"
                size="compact"
              >
                Previous
              </Button>
              <span className="text-[10px] text-[#6d7b85]">
                {page} / {pageCount}
              </span>
              <Button
                disabled={page >= pageCount}
                onClick={() => setPage(page + 1)}
                variant="secondary"
                size="compact"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      <p
        className={cn(
          "mt-5 flex items-center gap-1.75 text-[10px] text-[#8495a1]",
          "[&_svg]:text-[#8b9ca9]",
        )}
      >
        <Icon name="alert" size={16} /> Faulty units are counted within their current
        custody, not added to total held.
      </p>
    </>
  );
}
