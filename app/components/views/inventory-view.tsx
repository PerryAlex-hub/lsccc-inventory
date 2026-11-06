"use client";

import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Icon } from "../ui/icons";
import { Select } from "../ui/select";
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
          "max-md:flex-wrap max-md:gap-[8px_12px]",
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
      <div className="mb-4 grid min-w-0 grid-cols-2 gap-3 md:flex md:items-center">
        <label className="col-span-full flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-line bg-white px-3 md:flex-1">
          <Icon name="search" size={18} className="text-muted" />
          <input
            aria-label="Search inventory"
            placeholder="Search inventory…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="w-full min-w-0 bg-transparent py-2 text-base outline-none md:text-[13px]"
          />
        </label>
        <div className="min-w-0 md:w-48">
          <Select
            label="Filter by category"
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            options={categories.map((value) => ({ value, label: value }))}
            searchable
          />
        </div>
        <div className="min-w-0 md:w-40">
          <Select
            label="Filter by stock status"
            value={stockFilter}
            onValueChange={(value) => {
              setStockFilter(value);
              setPage(1);
            }}
            options={["All stock", "Low stock", "Has faults"].map((value) => ({
              value,
              label: value,
            }))}
          />
        </div>
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
              "max-md:flex-col max-md:items-start",
            )}
          >
            <span>
              Showing {filteredEquipment.length === 0 ? 0 : (page - 1) * 6 + 1}–
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
