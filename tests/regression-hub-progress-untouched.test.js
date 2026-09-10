import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sibling = (...parts) => resolve(root, "..", ...parts);

function read(path) {
  return readFileSync(path, "utf8");
}

test("Reports SPA never embeds a service-role key", () => {
  const config = read(resolve(root, "src/config.ts"));
  assert.match(config, /publishableKey/);
  assert.doesNotMatch(config, /service_role|SERVICE_ROLE|sb_secret_/i);
});

test("Reports SPA calls only the approved Phase 1A RPC", () => {
  const api = read(resolve(root, "src/api/reporting-api.ts"));
  assert.match(api, /my_hub_activity_progress/);
  assert.doesNotMatch(
    api,
    /submit_attempt|mark_formative_response|save_activity_state|from\(["']learning\.|admin_api/
  );
});

const hasHubProgressSources =
  existsSync(sibling("learning-platform-ui", "src", "activities", "PracticeProgressPanel.tsx")) &&
  existsSync(sibling("unit-3-Cyber-Security-Hub", "src", "pages", "WeekPage.tsx"));

test("Phase 1B does not modify hub progress UI sources", { skip: !hasHubProgressSources }, () => {
  const progressPanel = sibling("learning-platform-ui", "src", "activities", "PracticeProgressPanel.tsx");
  const progressSummary = sibling("learning-platform-ui", "src", "activities", "ProgressSummary.tsx");
  const unit3Week = sibling("unit-3-Cyber-Security-Hub", "src", "pages", "WeekPage.tsx");
  const unit3Activity = sibling("unit-3-Cyber-Security-Hub", "src", "pages", "ActivityPage.tsx");

  for (const path of [progressPanel, progressSummary, unit3Week, unit3Activity]) {
    assert.equal(existsSync(path), true, `expected untouched source at ${path}`);
  }

  const weekPage = read(unit3Week);
  const activityPage = read(unit3Activity);
  assert.match(weekPage, /PracticeProgressPanel/);
  assert.match(activityPage, /PracticeProgressPanel/);
  assert.doesNotMatch(weekPage, /learning-platform-reports|Session report available|View your Lesson/);
  assert.doesNotMatch(activityPage, /learning-platform-reports|Session report available|View your Lesson/);
});

test("Reports SPA does not depend on protected table reads from the browser", () => {
  const srcFiles = ["src/api/reporting-api.ts", "src/App.tsx", "src/config.ts"];
  for (const relative of srcFiles) {
    const text = read(resolve(root, relative));
    assert.doesNotMatch(text, /\.from\(["']learning\./);
    assert.doesNotMatch(text, /service_role/);
  }
});
