/**
 * Unit checks for landing lead admin emails.
 * Run: pnpm exec tsx scripts/test-lead-email.ts
 */
import assert from "node:assert/strict";
import { getAdminNotifyEmail } from "../lib/email/client";
import { buildLeadNotificationContent } from "../lib/email/invoice-notifications";

const tests: Array<{ name: string; fn: () => void }> = [];

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function setEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

test("getAdminNotifyEmail prefers ADMIN_NOTIFY_EMAIL", () => {
  const prevAdmin = process.env.ADMIN_NOTIFY_EMAIL;
  const prevLead = process.env.LEAD_NOTIFY_EMAIL;
  setEnv("ADMIN_NOTIFY_EMAIL", "admin@simplefactu.com");
  setEnv("LEAD_NOTIFY_EMAIL", "leads@simplefactu.com");
  assert.equal(getAdminNotifyEmail(), "admin@simplefactu.com");
  setEnv("ADMIN_NOTIFY_EMAIL", prevAdmin);
  setEnv("LEAD_NOTIFY_EMAIL", prevLead);
});

test("getAdminNotifyEmail falls back to LEAD_NOTIFY_EMAIL", () => {
  const prevAdmin = process.env.ADMIN_NOTIFY_EMAIL;
  const prevLead = process.env.LEAD_NOTIFY_EMAIL;
  setEnv("ADMIN_NOTIFY_EMAIL", undefined);
  setEnv("LEAD_NOTIFY_EMAIL", "leads@simplefactu.com");
  assert.equal(getAdminNotifyEmail(), "leads@simplefactu.com");
  setEnv("ADMIN_NOTIFY_EMAIL", prevAdmin);
  setEnv("LEAD_NOTIFY_EMAIL", prevLead);
});

test("getAdminNotifyEmail keeps a single address", () => {
  const prevAdmin = process.env.ADMIN_NOTIFY_EMAIL;
  setEnv("ADMIN_NOTIFY_EMAIL", "me@simplefactu.com, other@example.com");
  assert.equal(getAdminNotifyEmail(), "me@simplefactu.com");
  setEnv("ADMIN_NOTIFY_EMAIL", prevAdmin);
});

test("email includes the full message the person wrote", () => {
  const message = "Hola,\nnecesito integrar Veri*Factu con Odoo.\n¿Me llamáis?\n<script>alert(1)</script>";
  const { html, text, subject } = buildLeadNotificationContent({
    name: "Ana Pérez",
    email: "ana@example.com",
    type: "autonomo",
    message,
    id: "lead_123",
  });
  assert.match(subject, /Ana Pérez/);
  assert.match(subject, /Autónomo/);
  assert.match(text, /necesito integrar Veri\*Factu con Odoo/);
  assert.match(text, /¿Me llamáis\?/);
  assert.match(html, /necesito integrar Veri\*Factu con Odoo/);
  assert.match(html, /white-space:pre-wrap/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /\/admin\/leads\/lead_123/);
});

test("empty message is labelled, not omitted", () => {
  const { html, text } = buildLeadNotificationContent({
    name: "Luis",
    email: "luis@example.com",
    type: "empresa",
    message: "   ",
  });
  assert.match(html, /sin mensaje/i);
  assert.match(text, /sin mensaje/i);
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}
console.log(`\n${passed}/${tests.length} passed`);
