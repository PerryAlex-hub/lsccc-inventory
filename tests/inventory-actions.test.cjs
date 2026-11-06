/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness registers the TypeScript loader before loading the app modules. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

// Run the app's pure TypeScript operations with the project's existing compiler.
require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(output.outputText, filename);
};
const { applyInventoryForm, transitionFault } = require("../app/lib/inventory-actions.ts");
const { initialState } = require("../app/lib/demo-data.ts");
const { maintenanceCsvRows } = require("../app/lib/maintenance-export.ts");
const { localDateTime, parseLocalDateTime } = require("../app/lib/workspace-utils.ts");
const now = "2026-11-06T15:30:00.000Z";
const receive = { equipmentId: "EQ-001", quantity: "3", supplier: "Delivery source", receivedAt: "2026-11-05T10:15" };
const blank = () => ({ equipment: [], receipts: [], issues: [], movements: [], faults: [], locations: [] });
const newEquipment = { equipmentId: "new", name: "Network switch", category: "Other", customCategory: "Networking", location: "Other", customLocation: "Annex store", reorder: "2" };

test("receipts keep the selected Lagos arrival time in both receipt and automatic history", () => {
  const result = applyInventoryForm(initialState, "receive", receive, now);
  assert.equal(result.error, null);
  assert.equal(result.state.receipts[0].date, "2026-11-05T09:15:00.000Z");
  assert.equal(result.state.movements[0].date, result.state.receipts[0].date);
  assert.equal(result.state.equipment[0].available, initialState.equipment[0].available + 3);
  assert.equal(result.state.receipts[0].reference, undefined);
});

test("the first delivery registers custom equipment, category and store atomically", () => {
  const state = blank();
  const result = applyInventoryForm(state, "receive", { ...receive, ...newEquipment }, now);
  assert.equal(result.error, null);
  assert.equal(result.state.equipment[0].category, "Networking");
  assert.equal(result.state.equipment[0].location, "Annex store");
  assert.equal(result.state.equipment[0].available, 3);
  assert.equal(result.state.receipts[0].equipmentId, result.state.equipment[0].id);
  assert.equal(result.state.locations.length, 0);
  assert.match(result.state.movements[0].description, /Annex store/);
  assert.equal(state.equipment.length, 0);
});

test("invalid arrival date leaves new equipment and all stock untouched", () => {
  const state = blank();
  for (const receivedAt of ["", "2026-11-07T10:15", "2026-02-30T10:15", "invalid"]) {
    const result = applyInventoryForm(state, "receive", { ...receive, ...newEquipment, receivedAt }, now);
    assert.ok(result.error);
    assert.equal(result.state, state);
  }
});

test("Other requires a concrete category and primary store", () => {
  for (const missing of ["customCategory", "customLocation"]) {
    const result = applyInventoryForm(blank(), "receive", { ...receive, ...newEquipment, [missing]: "   " }, now);
    assert.ok(result.error);
  }
});

test("registered custom groups can be reused when editing without changing balances", () => {
  const result = applyInventoryForm(initialState, "edit", { equipmentId: "EQ-001", name: "Renamed laptop", category: "Networking", location: "Annex store", reorder: "2" }, now);
  assert.equal(result.error, null);
  assert.equal(result.state.equipment[0].category, "Networking");
  assert.equal(result.state.equipment[0].available, initialState.equipment[0].available);
  assert.equal(result.state.equipment[0].issued, initialState.equipment[0].issued);
});

test("missing selection, duplicate equipment and invalid quantities cannot change stock", () => {
  for (const fields of [{ ...receive, equipmentId: "" }, ...["0", "-1", "1.5", "NaN"].map((quantity) => ({ ...receive, quantity })), { ...receive, ...newEquipment, name: " dell latitude 5440 " }]) {
    const result = applyInventoryForm(initialState, "receive", fields, now);
    assert.ok(result.error);
    assert.equal(result.state, initialState);
  }
});

test("issuing stock records free-text custody without location registration and enforces available count", () => {
  const fields = { equipmentId: "EQ-001", quantity: "2", assignee: "Custodian", department: "Annex, room 4" };
  const result = applyInventoryForm(initialState, "issue", fields, now);
  assert.equal(result.error, null);
  assert.equal(result.state.equipment[0].available, 10);
  assert.equal(result.state.equipment[0].issued, 10);
  assert.equal(result.state.issues[0].department, "Annex, room 4");
  assert.equal(result.state.locations, initialState.locations);
  assert.ok(applyInventoryForm(initialState, "issue", { ...fields, quantity: "13" }, now).error);
});

test("fault reports exclude units already in maintenance", () => {
  const fields = { equipmentId: "EQ-001", quantity: "7", title: "Fault", location: "Annex", custodian: "Custodian", priority: "High" };
  assert.ok(applyInventoryForm(initialState, "fault", fields, now).error);
  const result = applyInventoryForm(initialState, "fault", { ...fields, quantity: "1" }, now);
  assert.equal(result.state.faults[0].status, "Reported");
  assert.equal(result.state.faults[0].history[0].date, now);
  assert.equal(result.state.equipment[0].faulty, 3);
});

test("maintenance follows forward stages and preserves dates, notes and custody", () => {
  const fault = initialState.faults.find((entry) => entry.status === "Reported");
  assert.ok(transitionFault(initialState, fault.id, "Resolved", { fixedAt: "2026-11-06T16:30", notes: "Fixed" }, now).error);
  const started = transitionFault(initialState, fault.id, "In progress", undefined, "2026-11-05T09:30:00.000Z");
  assert.equal(started.error, null);
  const result = transitionFault(started.state, fault.id, "Resolved", { fixedAt: "2026-11-06T10:00", notes: "  Replaced battery; tested charging.  " }, now);
  assert.equal(result.error, null);
  const fixed = result.state.faults.find((entry) => entry.id === fault.id);
  assert.equal(fixed.resolvedAt, "2026-11-06T09:00:00.000Z");
  assert.equal(fixed.repairNotes, "Replaced battery; tested charging.");
  assert.deepEqual(fixed.history.map((entry) => entry.status), ["Reported", "In progress", "Resolved"]);
  const item = result.state.equipment.find((entry) => entry.id === fault.equipmentId);
  const before = initialState.equipment.find((entry) => entry.id === fault.equipmentId);
  assert.equal(item.faulty, before.faulty - fault.quantity);
  assert.equal(item.issued, before.issued);
  assert.equal(item.available, before.available);
  assert.equal(result.state.movements[0].date, fixed.resolvedAt);
  const repeated = transitionFault(result.state, fault.id, "Resolved", { fixedAt: "2026-11-06T10:00", notes: "Fixed again" }, now);
  assert.ok(repeated.error);
  assert.equal(repeated.state, result.state);
});

test("a repair can be completed during the same minute it started", () => {
  const started = transitionFault(initialState, "MNT-0002", "In progress", undefined, now);
  assert.equal(transitionFault(started.state, "MNT-0002", "Resolved", { fixedAt: "2026-11-06T16:30", notes: "Fixed" }, now).error, null);
});

test("repair completion rejects missing notes, future dates and dates before work began", () => {
  const started = transitionFault(initialState, "MNT-0002", "In progress", undefined, "2026-11-05T09:30:00.000Z");
  for (const details of [{ fixedAt: "2026-11-06T10:00", notes: " " }, { fixedAt: "2026-11-07T10:00", notes: "Fixed" }, { fixedAt: "2026-11-04T10:00", notes: "Fixed" }]) {
    const result = transitionFault(started.state, "MNT-0002", "Resolved", details, now);
    assert.ok(result.error);
    assert.equal(result.state, started.state);
  }
});

test("pending and completed downloads contain separate records and repair details", () => {
  const result = transitionFault(initialState, "MNT-0001", "Resolved", { fixedAt: "2026-11-06T10:00", notes: "Repaired antenna" }, now);
  const pending = maintenanceCsvRows(result.state, false);
  const fixes = maintenanceCsvRows(result.state, true);
  assert.equal(pending.length, initialState.faults.length);
  assert.equal(fixes.length, 2);
  assert.equal(fixes[1][0], "MNT-0001");
  assert.equal(fixes[1].at(-1), "Repaired antenna");
  assert.ok(!pending.slice(1).some((row) => row[0] === "MNT-0001"));
});

test("Lagos picker values round trip independently of the host timezone", () => {
  assert.equal(localDateTime(new Date(now)), "2026-11-06T16:30");
  assert.equal(parseLocalDateTime("2026-11-06T16:30"), now);
});
