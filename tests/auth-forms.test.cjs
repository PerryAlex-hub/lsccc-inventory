/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness. */
require("./register-typescript.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const { validateAuthForm, submitAuthForm } = require("../app/lib/auth-forms.ts");

const values = {
  email: " officer@example.org ",
  password: "strong-password-12",
  confirmPassword: "strong-password-12",
  name: "Officer",
};

test("sign-in validates credentials without applying new-password rules to an existing password", () => {
  assert.deepEqual(validateAuthForm("sign-in", { ...values, password: "existing" }), {});
  assert.ok(validateAuthForm("sign-in", { ...values, email: "invalid" }).email);
  assert.ok(validateAuthForm("sign-in", { ...values, password: "" }).password);
});

test("invitation setup requires a name, valid email and matching new passwords", () => {
  assert.deepEqual(validateAuthForm("accept-invitation", values), {});
  assert.ok(validateAuthForm("accept-invitation", { ...values, name: " " }).name);
  assert.ok(
    validateAuthForm("accept-invitation", { ...values, confirmPassword: "other" })
      .confirmPassword,
  );
  assert.ok(
    validateAuthForm("accept-invitation", { ...values, password: "short1" }).password,
  );
  assert.ok(
    validateAuthForm("accept-invitation", { ...values, password: "abcdefghijkl" })
      .password,
  );
});

test("password recovery does not require a password and reset does not require an email", () => {
  assert.deepEqual(validateAuthForm("forgot-password", { ...values, password: "" }), {});
  assert.deepEqual(validateAuthForm("reset-password", { ...values, email: "" }), {});
});

test("unavailable authentication never reports success", async (context) => {
  context.mock.method(
    global,
    "fetch",
    async () => new Response("Unavailable", { status: 404 }),
  );
  const result = await submitAuthForm("sign-in", values);
  assert.equal(result.ok, false);
  assert.match(result.message, /currently unavailable/);
});

test("recovery sends only the email and accepts only an explicit successful API response", async (context) => {
  let request;
  context.mock.method(global, "fetch", async (url, init) => {
    request = { url, ...init };
    return Response.json({ ok: true });
  });
  assert.deepEqual(await submitAuthForm("forgot-password", values), { ok: true });
  assert.deepEqual(JSON.parse(request.body), { email: "officer@example.org" });
  assert.equal(request.credentials, "same-origin");
});

test("incorrect credentials, expired links and network errors have distinct recovery messages", async (context) => {
  const mock = context.mock.method(global, "fetch", async () =>
    Response.json({}, { status: 401 }),
  );
  assert.match((await submitAuthForm("sign-in", values)).message, /incorrect/);
  mock.mock.mockImplementation(async () => Response.json({}, { status: 410 }));
  assert.match(
    (await submitAuthForm("reset-password", values, "expired")).message,
    /expired/,
  );
  mock.mock.mockImplementation(async () => {
    throw new Error("Disconnected");
  });
  assert.match((await submitAuthForm("sign-in", values)).message, /connection/);
});
