"use client";

import { useState, type FormEvent } from "react";
import { equipmentName, type Fault, type InventoryState } from "../../lib/demo-data";
import { maintenanceCsvRows } from "../../lib/maintenance-export";
import { downloadCsv, formatDateTime, localDateTime } from "../../lib/workspace-utils";
import { Icon } from "../ui/icons";
import { EmptyState } from "../ui/inventory-widgets";
import type { WorkspaceViewProps } from "./view-props";

type Props = Pick<WorkspaceViewProps, "state" | "updateFault" | "setForm">;
const stages = ["Reported", "In progress", "Resolved"] as const;
const label = (status: Fault["status"]) => status === "Resolved" ? "Fixed" : status;

function MaintenanceCase({ fault, state, updateFault }: { fault: Fault; state: InventoryState; updateFault: Props["updateFault"] }) {
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
    <article className="maintenance-case">
      <div className="maintenance-case-heading">
        <div><span className="section-kicker">{fault.id}</span><h3>{fault.title}</h3><p>{equipmentName(state.equipment, fault.equipmentId)} · {fault.quantity} {fault.quantity === 1 ? "unit" : "units"}</p></div>
        <span className={`priority priority-${fault.priority.toLowerCase()}`}>{fault.priority} priority</span>
      </div>
      <ol className="repair-stages" aria-label="Repair progress">
        {stages.map((stage, index) => <li key={stage} className={stages.indexOf(fault.status) >= index ? "stage-reached" : ""} aria-current={fault.status === stage ? "step" : undefined}><span>{stages.indexOf(fault.status) > index ? <Icon name="check" size={13} /> : index + 1}</span>{label(stage)}</li>)}
      </ol>
      <dl className="maintenance-meta">
        <div><dt>Current location</dt><dd>{fault.location}</dd></div><div><dt>Custodian</dt><dd>{fault.custodian}</dd></div>
        <div><dt>Reported</dt><dd>{formatDateTime(fault.date)}</dd></div>
        {fault.startedAt && <div><dt>Repair started</dt><dd>{formatDateTime(fault.startedAt)}</dd></div>}
        {fault.status === "Resolved" && <div><dt>Date fixed</dt><dd>{fault.resolvedAt ? formatDateTime(fault.resolvedAt) : "Not recorded in this older record"}</dd></div>}
      </dl>
      {fault.repairNotes && <div className="repair-notes"><strong>Work completed</strong><p>{fault.repairNotes}</p></div>}
      {fault.status === "Reported" && <div className="maintenance-next"><p>Next: start the repair when work begins.</p><button className="button secondary" onClick={() => { const result = updateFault(fault, "In progress"); if (result) setError(result); }}>Start repair <Icon name="arrow" size={15} /></button></div>}
      {fault.status === "In progress" && !completing && <div className="maintenance-next"><p>When repaired, record the fix and its completion date.</p><button className="button secondary" onClick={() => { setFixedAt(localDateTime()); setCompleting(true); }}>Record fix <Icon name="check" size={15} /></button></div>}
      {completing && <form className="repair-completion" onSubmit={complete}>
        <h4>Record completed repair</h4><p>The affected units will leave maintenance and stay with their current custodian.</p>
        <label className="field"><span>Date and time fixed</span><input type="datetime-local" required value={fixedAt} min={localDateTime(new Date(fault.startedAt || fault.date))} max={localDateTime()} onChange={(event) => { setFixedAt(event.target.value); setError(""); }} /><small>Lagos time (WAT)</small></label>
        <label className="field"><span>What was fixed?</span><textarea required rows={3} value={notes} placeholder="e.g. Replaced the battery and tested charging." onChange={(event) => { setNotes(event.target.value); setError(""); }} /></label>
        <div className="repair-form-actions"><button type="button" className="button secondary" onClick={() => { setCompleting(false); setError(""); }}>Cancel</button><button type="submit" className="button primary">Save completed repair <Icon name="check" size={15} /></button></div>
      </form>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <details className="repair-history"><summary>View status history</summary><ol>{(fault.history || [{ status: "Reported", date: fault.date }, ...(fault.startedAt ? [{ status: "In progress", date: fault.startedAt }] : []), ...(fault.resolvedAt ? [{ status: "Resolved", date: fault.resolvedAt }] : [])]).map((entry, index) => <li key={`${entry.status}-${index}`}><strong>{label(entry.status as Fault["status"])}</strong><time dateTime={entry.date}>{formatDateTime(entry.date)}</time></li>)}</ol>{!fault.history && <p>Older records may not include every status change.</p>}</details>
    </article>
  );
}

export function MaintenanceView({ state, updateFault, setForm }: Props) {
  const [filter, setFilter] = useState("Pending");
  const pending = state.faults.filter((fault) => fault.status !== "Resolved");
  const fixed = state.faults.filter((fault) => fault.status === "Resolved");
  const filtered = state.faults.filter((fault) => filter === "Pending" ? fault.status !== "Resolved" : filter === "Fixed" ? fault.status === "Resolved" : fault.status === filter);
  const counts: Record<string, number> = { Pending: pending.length, Reported: pending.filter((fault) => fault.status === "Reported").length, "In progress": pending.filter((fault) => fault.status === "In progress").length, Fixed: fixed.length };
  return <>
    <div className="maintenance-guide"><Icon name="tool" size={22} /><div><strong>From fault report to completed repair</strong><p>Start a reported repair, then record what was fixed and when. Completed repairs stay available in the Fixed tab.</p></div></div>
    <div className="maintenance-downloads"><button className="button secondary" disabled={!pending.length} onClick={() => downloadCsv("lsccc-pending-maintenance.csv", maintenanceCsvRows(state, false))}><Icon name="download" size={16} />Download pending issues ({pending.length})</button><button className="button secondary" disabled={!fixed.length} onClick={() => downloadCsv("lsccc-completed-repairs.csv", maintenanceCsvRows(state, true))}><Icon name="download" size={16} />Download fixes ({fixed.length})</button></div>
    <div className="maintenance-filters" role="group" aria-label="Filter maintenance by status">{Object.entries(counts).map(([name, count]) => <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}<span>{count}</span></button>)}</div>
    <div className="maintenance-list">{filtered.map((fault) => <MaintenanceCase key={fault.id} fault={fault} state={state} updateFault={updateFault} />)}{!filtered.length && <><EmptyState title={filter === "Fixed" ? "No completed repairs yet" : "No repairs in this stage"} message={filter === "Fixed" ? "Start a repair, then record its fix. The completed record will appear here." : "Report a fault to begin tracking a repair, or select another stage."} />{!state.faults.length && <button className="button secondary" onClick={() => setForm("fault")}>Report a fault</button>}</>}</div>
  </>;
}
