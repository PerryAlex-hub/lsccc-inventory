import "server-only";
import type { Database } from "./db";
import type { InventoryState, Fault } from "../demo-data";
import type { Member } from "../access";
import { applyInventoryForm, transitionFault } from "../inventory-actions";
import type { FormKind } from "../workspace-config";
import { ApiError, digest, text } from "./security";
import { audit } from "./accounts";
import type { Prisma } from "../../generated/prisma/client";

export async function readInventory(db: Database): Promise<InventoryState> {
  const datedOrder = [{ date: "desc" as const }, { id: "desc" as const }];
  const [equipment, receipts, issues, faults, movements] = await Promise.all([
    db.equipment.findMany({ orderBy: { id: "asc" } }),
    db.receipt.findMany({ orderBy: datedOrder }),
    db.issue.findMany({ orderBy: datedOrder }),
    db.fault.findMany({ orderBy: datedOrder }),
    db.movement.findMany({ orderBy: datedOrder }),
  ]);
  return {
    equipment,
    receipts: receipts.map((record) => ({ ...record, date: record.date.toISOString() })),
    issues: issues.map((record) => ({ ...record, date: record.date.toISOString() })),
    faults: faults.map((record) => ({
      ...record,
      priority: record.priority as Fault["priority"],
      status: record.status as Fault["status"],
      date: record.date.toISOString(),
      startedAt: record.startedAt?.toISOString(),
      resolvedAt: record.resolvedAt?.toISOString(),
      repairNotes: record.repairNotes ?? undefined,
      history: record.history as Fault["history"],
    })),
    movements: movements.map((record) => ({
      ...record,
      type: record.type as InventoryState["movements"][number]["type"],
      date: record.date.toISOString(),
    })),
    locations: [],
  };
}

function changed<T extends { id: string }>(before: T[], after: T[]) {
  const previous = new Map(before.map((record) => [record.id, JSON.stringify(record)]));
  return after.filter((record) => previous.get(record.id) !== JSON.stringify(record));
}

async function saveChanges(db: Database, before: InventoryState, after: InventoryState) {
  for (const { id, ...data } of changed(before.equipment, after.equipment)) {
    await db.equipment.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
  for (const record of changed(before.receipts, after.receipts)) {
    const { id, equipmentId, quantity, supplier, date } = record;
    const data = { equipmentId, quantity, supplier, date };
    await db.receipt.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
  for (const { id, ...data } of changed(before.issues, after.issues)) {
    await db.issue.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
  for (const { id, history, ...record } of changed(before.faults, after.faults)) {
    const data = { ...record, history: (history || []) as Prisma.InputJsonValue };
    await db.fault.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
  for (const { id, ...data } of changed(before.movements, after.movements)) {
    await db.movement.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
}
export function formFields(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ApiError(400, "Complete the form before saving.");
  const fields: Record<string, string> = {};
  const allowed = [
    "equipmentId",
    "name",
    "category",
    "customCategory",
    "location",
    "customLocation",
    "reorder",
    "quantity",
    "supplier",
    "receivedAt",
    "assignee",
    "department",
    "title",
    "custodian",
    "priority",
  ];
  for (const [key, input] of Object.entries(value)) {
    if (!allowed.includes(key) || typeof input !== "string" || input.length > 1000)
      throw new ApiError(400, "One or more fields are invalid or too long.");
    fields[key] = input;
  }
  for (const key of ["quantity", "reorder"]) {
    if (
      fields[key] &&
      (!/^\d+$/.test(fields[key]) || Number(fields[key]) > 1_000_000_000)
    )
      throw new ApiError(400, "Enter a whole quantity of up to 1,000,000,000.");
  }
  return fields;
}

export async function mutateInventory(
  db: Database,
  member: Member,
  body: Record<string, unknown>,
  requestKey: string | null,
) {
  if (
    !requestKey ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      requestKey,
    )
  )
    throw new ApiError(400, "A valid request identifier is required.");
  const fingerprint = digest(JSON.stringify(body));
  const existing = await db.mutationRequest.findUnique({ where: { key: requestKey } });
  if (existing) {
    if (existing.userId !== member.id || existing.fingerprint !== fingerprint)
      throw new ApiError(409, "This request identifier was already used.");
    return readInventory(db);
  }
  const state = await readInventory(db);
  let result;
  if (body.action === "maintenance") {
    if (body.status !== "In progress" && body.status !== "Resolved")
      throw new ApiError(400, "Choose the next repair stage.");
    const details = body.status === "Resolved" ? formRepair(body.details) : undefined;
    result = transitionFault(
      state,
      text(body.id, "maintenance record"),
      body.status as Fault["status"],
      details,
    );
  } else {
    if (!["equipment", "edit", "receive", "issue", "fault"].includes(String(body.kind)))
      throw new ApiError(400, "Choose a valid inventory action.");
    result = applyInventoryForm(state, body.kind as FormKind, formFields(body.fields));
  }
  if (result.error) throw new ApiError(400, result.error);
  if (result.state.equipment.some((item) => item.available + item.issued > 2_000_000_000))
    throw new ApiError(400, "This quantity exceeds the equipment balance limit.");
  const oldMovements = new Set(state.movements.map((movement) => movement.id));
  result.state.movements = result.state.movements.map((movement) =>
    oldMovements.has(movement.id) ? movement : { ...movement, actor: member.name },
  );
  await saveChanges(db, state, result.state);
  await db.mutationRequest.create({
    data: { key: requestKey, userId: member.id, fingerprint },
  });
  await audit(
    db,
    member.id,
    body.action === "maintenance"
      ? `maintenance.${body.status}`
      : `inventory.${body.kind}`,
    result.equipmentId || String(body.id || ""),
  );
  return result.state;
}

function formRepair(value: unknown) {
  if (!value || typeof value !== "object")
    throw new ApiError(400, "Record the fix and completion date.");
  const details = value as Record<string, unknown>;
  return {
    fixedAt: text(details.fixedAt, "completion date", 30),
    notes: text(details.notes, "repair notes", 4000),
  };
}
