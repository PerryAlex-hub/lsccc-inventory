"use client";

import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Field, Input, Textarea } from "@/app/components/ui/form-fields";
import { useState, type FormEvent } from "react";
import { equipmentName, type Fault, type InventoryState } from "../../lib/demo-data";
import { maintenanceCsvRows } from "../../lib/maintenance-export";
import { downloadCsv, formatDateTime, localDateTime } from "../../lib/workspace-utils";
import { Icon } from "../ui/icons";
import { EmptyState } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "updateFault" | "setForm">;

const stages = ["Reported", "In progress", "Resolved"] as const;

const label = (status: Fault["status"]) => (status === "Resolved" ? "Fixed" : status);

function MaintenanceCase({
  fault,
  state,
  updateFault,
}: {
  fault: Fault;
  state: InventoryState;
  updateFault: Props["updateFault"];
}) {
  const [completing, setCompleting] = useState(false);
  const [fixedAt, setFixedAt] = useState(localDateTime());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const complete = (event: FormEvent) => {
    event.preventDefault();
    const result = updateFault(fault, "Resolved", { fixedAt, notes });
    if (result) setError(result);
    else setCompleting(false);
  };
  return (
    <article
      className={cn(
        "min-w-0 rounded-[10px] border border-line bg-white px-6 py-6",
        "max-[681px]:px-4.5 max-[681px]:py-4.5",
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          "[&_h3]:mt-1.5 [&_h3]:text-[17px] [&_h3]:wrap-anywhere",
          "[&_p]:mt-1.5 [&_p]:text-[12px] [&_p]:text-[#60717c]",
          "[&>span]:whitespace-nowrap",
          "max-[681px]:flex-wrap",
        )}
      >
        <div>
          <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
            {fault.id}
          </span>
          <h3>{fault.title}</h3>
          <p>
            {equipmentName(state.equipment, fault.equipmentId)} · {fault.quantity}{" "}
            {fault.quantity === 1 ? "unit" : "units"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-[4px] px-1.75 py-1.25 text-[9px] font-bold",
            "data-[priority=high]:bg-[#fbecea] data-[priority=high]:text-[#a45142]",
            "data-[priority=medium]:bg-[#fcf2e4] data-[priority=medium]:text-[#a36e2d]",
            "data-[priority=low]:bg-[#edf3ef] data-[priority=low]:text-[#3f725b]",
          )}
          data-priority={fault.priority.toLowerCase()}
        >
          {fault.priority} priority
        </span>
      </div>
      <ol
        className={cn(
          "mx-0 my-6 flex list-none gap-2 px-0 py-0",
          "[&_li]:flex [&_li]:flex-1 [&_li]:items-center [&_li]:gap-2 [&_li]:border-b-2 [&_li]:border-b-[#e7edf1]",
          "[&_li]:px-0 [&_li]:py-2.5 [&_li]:text-[12px] [&_li]:text-[#687985]",
          "[&_li>span]:grid [&_li>span]:h-5.75 [&_li>span]:w-5.75 [&_li>span]:place-items-center [&_li>span]:rounded-full",
          "[&_li>span]:shrink-0 [&_li>span]:bg-[#eff3f5] [&_li>span]:text-[11px]",
          "max-[681px]:gap-1.5",
          "max-[681px]:[&_li]:gap-1.25 max-[681px]:[&_li]:text-[11px]",
          "[&_li[data-reached=true]]:border-b-[#6a8c78] [&_li[data-reached=true]]:text-[#315a43]",
          "[&_li[aria-current=step]]:font-[750]",
          "[&_li[data-reached=true]>span]:bg-[#e6f0e9]",
        )}
        aria-label="Repair progress"
      >
        {stages.map((stage, index) => (
          <li
            key={stage}
            data-reached={stages.indexOf(fault.status) >= index}
            aria-current={fault.status === stage ? "step" : undefined}
          >
            <span>
              {stages.indexOf(fault.status) > index ? (
                <Icon name="check" size={13} />
              ) : (
                index + 1
              )}
            </span>
            {label(stage)}
          </li>
        ))}
      </ol>
      <dl
        className={cn(
          "mx-0 mt-0 mb-5.5 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4.5",
          "[&_dt]:text-[11px] [&_dt]:text-[#687985]",
          "[&_dd]:mx-0 [&_dd]:mt-1.5 [&_dd]:mb-0 [&_dd]:text-[12px] [&_dd]:leading-[1.6] [&_dd]:wrap-anywhere",
        )}
      >
        <div>
          <dt>Current location</dt>
          <dd>{fault.location}</dd>
        </div>
        <div>
          <dt>Custodian</dt>
          <dd>{fault.custodian}</dd>
        </div>
        <div>
          <dt>Reported</dt>
          <dd>{formatDateTime(fault.date)}</dd>
        </div>
        {fault.startedAt && (
          <div>
            <dt>Repair started</dt>
            <dd>{formatDateTime(fault.startedAt)}</dd>
          </div>
        )}
        {fault.status === "Resolved" && (
          <div>
            <dt>Date fixed</dt>
            <dd>
              {fault.resolvedAt
                ? formatDateTime(fault.resolvedAt)
                : "Not recorded in this older record"}
            </dd>
          </div>
        )}
      </dl>
      {fault.repairNotes && (
        <div
          className={cn(
            "border-t border-t-line pt-4 text-[12px]",
            "[&_p]:mt-2 [&_p]:leading-[1.7] [&_p]:wrap-anywhere [&_p]:whitespace-pre-wrap [&_p]:text-[#526573]",
          )}
        >
          <strong>Work completed</strong>
          <p>{fault.repairNotes}</p>
        </div>
      )}
      {fault.status === "Reported" && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3.5 border-t border-t-line pt-4.5",
            "[&_p]:text-[12px] [&_p]:text-[#60717c]",
          )}
        >
          <p>Next: start the repair when work begins.</p>
          <Button
            onClick={() => {
              const result = updateFault(fault, "In progress");
              if (result) setError(result);
            }}
            variant="secondary"
          >
            Start repair <Icon name="arrow" size={15} />
          </Button>
        </div>
      )}
      {fault.status === "In progress" && !completing && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3.5 border-t border-t-line pt-4.5",
            "[&_p]:text-[12px] [&_p]:text-[#60717c]",
          )}
        >
          <p>When repaired, record the fix and its completion date.</p>
          <Button
            onClick={() => {
              setFixedAt(localDateTime());
              setCompleting(true);
            }}
            variant="secondary"
          >
            Record fix <Icon name="check" size={15} />
          </Button>
        </div>
      )}
      {completing && (
        <form
          className={cn(
            "mt-5 rounded-[8px] bg-[#f5f8fa] px-5 py-5",
            "[&_h4]:text-[14px]",
            "[&>p]:mx-0 [&>p]:mt-2 [&>p]:mb-4.5 [&>p]:text-[12px] [&>p]:leading-[1.6] [&>p]:text-[#526573]",
            "[&_label_input]:max-w-85 [&_label_input]:text-[13px]",
            "[&_label_textarea]:text-[13px]",
            "max-[681px]:px-4 max-[681px]:py-4",
            "max-[681px]:[&_label_input]:text-[16px]",
            "max-[681px]:[&_label_textarea]:text-[16px]",
          )}
          onSubmit={complete}
        >
          <h4>Record completed repair</h4>
          <p>
            The affected units will leave maintenance and stay with their current
            custodian.
          </p>
          <Field variant="repair">
            <span>Date and time fixed</span>
            <Input
              type="datetime-local"
              required
              value={fixedAt}
              min={localDateTime(new Date(fault.startedAt || fault.date))}
              max={localDateTime()}
              onChange={(event) => {
                setFixedAt(event.target.value);
                setError("");
              }}
              variant="repair"
            />
            <small>Lagos time (WAT)</small>
          </Field>
          <Field variant="repair">
            <span>What was fixed?</span>
            <Textarea
              required
              rows={3}
              value={notes}
              placeholder="e.g. Replaced the battery and tested charging."
              onChange={(event) => {
                setNotes(event.target.value);
                setError("");
              }}
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button
              type="button"
              onClick={() => {
                setCompleting(false);
                setError("");
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save completed repair <Icon name="check" size={15} />
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p
          className={cn(
            "flex items-start gap-2 rounded-[7px] border border-[#f3d5cb] bg-[#fbeeea] px-2.75 text-[11px] text-[#a45e4c]",
            "mx-0 my-2.5 py-2.75",
          )}
          role="alert"
        >
          {error}
        </p>
      )}
      <details
        className={cn(
          "mt-5 text-[11px] text-[#526573]",
          "[&_summary]:w-[fit-content] [&_summary]:cursor-pointer [&_summary]:px-0 [&_summary]:py-2",
          "[&_ol]:grid [&_ol]:list-none [&_ol]:gap-2.5 [&_ol]:px-0 [&_ol]:py-2",
          "[&_li]:flex [&_li]:flex-wrap [&_li]:gap-[8px_18px]",
        )}
      >
        <summary>View status history</summary>
        <ol>
          {(
            fault.history || [
              { status: "Reported", date: fault.date },
              ...(fault.startedAt
                ? [{ status: "In progress", date: fault.startedAt }]
                : []),
              ...(fault.resolvedAt
                ? [{ status: "Resolved", date: fault.resolvedAt }]
                : []),
            ]
          ).map((entry, index) => (
            <li key={`${entry.status}-${index}`}>
              <strong>{label(entry.status as Fault["status"])}</strong>
              <time dateTime={entry.date}>{formatDateTime(entry.date)}</time>
            </li>
          ))}
        </ol>
        {!fault.history && <p>Older records may not include every status change.</p>}
      </details>
    </article>
  );
}

export function MaintenanceView({ state, updateFault, setForm }: Props) {
  const [filter, setFilter] = useState("Pending");
  const pending = state.faults.filter((fault) => fault.status !== "Resolved");
  const fixed = state.faults.filter((fault) => fault.status === "Resolved");
  const filtered = state.faults.filter((fault) =>
    filter === "Pending"
      ? fault.status !== "Resolved"
      : filter === "Fixed"
        ? fault.status === "Resolved"
        : fault.status === filter,
  );
  const counts: Record<string, number> = {
    Pending: pending.length,
    Reported: pending.filter((fault) => fault.status === "Reported").length,
    "In progress": pending.filter((fault) => fault.status === "In progress").length,
    Fixed: fixed.length,
  };
  return (
    <>
      <div
        className={cn(
          "mb-3 flex items-start gap-3.5 border-t border-b border-t-line border-b-line px-0 py-5",
          "[&_svg]:shrink-0 [&_svg]:text-[#506a78]",
          "[&_strong]:text-[14px]",
          "[&_p]:mt-1.5 [&_p]:max-w-[75ch] [&_p]:text-[12px] [&_p]:leading-[1.7] [&_p]:text-[#60717c]",
        )}
      >
        <Icon name="tool" size={22} />
        <div>
          <strong>From fault report to completed repair</strong>
          <p>
            Start a reported repair, then record what was fixed and when. Completed
            repairs stay available in the Fixed tab.
          </p>
        </div>
      </div>
      <div
        className={cn(
          "mx-0 mt-5 mb-6 flex flex-wrap gap-2.5",
          "max-[681px]:[&>button]:min-h-11 max-[681px]:[&>button]:flex-1",
        )}
      >
        <Button
          disabled={!pending.length}
          onClick={() =>
            downloadCsv("lsccc-pending-maintenance.csv", maintenanceCsvRows(state, false))
          }
          variant="secondary"
        >
          <Icon name="download" size={16} />
          Download pending issues ({pending.length})
        </Button>
        <Button
          disabled={!fixed.length}
          onClick={() =>
            downloadCsv("lsccc-completed-repairs.csv", maintenanceCsvRows(state, true))
          }
          variant="secondary"
        >
          <Icon name="download" size={16} />
          Download fixes ({fixed.length})
        </Button>
      </div>
      <div
        className={cn(
          "mb-5 flex flex-wrap gap-2",
          "[&_button]:flex [&_button]:min-h-10.5 [&_button]:items-center [&_button]:gap-2.25 [&_button]:border",
          "[&_button]:rounded-[6px] [&_button]:border-line [&_button]:bg-white [&_button]:text-[#526573]",
          "[&_button]:cursor-pointer [&_button]:px-3.5 [&_button]:py-2 [&_button]:text-[12px]",
          "[&_span]:tabular-nums [&_span]:opacity-[.8]",
          "[&_button[aria-pressed=true]]:border-[#2f4654] [&_button[aria-pressed=true]]:bg-[#2f4654]",
          "[&_button[aria-pressed=true]]:text-white",
        )}
        role="group"
        aria-label="Filter maintenance by status"
      >
        {Object.entries(counts).map(([name, count]) => (
          <button
            key={name}
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {name}
            <span>{count}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        {filtered.map((fault) => (
          <MaintenanceCase
            key={fault.id}
            fault={fault}
            state={state}
            updateFault={updateFault}
          />
        ))}
        {!filtered.length && (
          <>
            <EmptyState
              title={
                filter === "Fixed"
                  ? "No completed repairs yet"
                  : "No repairs in this stage"
              }
              message={
                filter === "Fixed"
                  ? "Start a repair, then record its fix. The completed record will appear here."
                  : "Report a fault to begin tracking a repair, or select another stage."
              }
            />
            {!state.faults.length && (
              <Button onClick={() => setForm("fault")} variant="secondary">
                Report a fault
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
