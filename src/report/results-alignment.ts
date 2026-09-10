/**
 * Re-export Results-aligned interpretation defaults used by the Reports SPA.
 * Source of truth for the numeric bands: `@learning-platform/results`
 * `buildDiagnostics({ strengthThreshold, weaknessThreshold })` defaults.
 */
export { REPORT_INTERPRETATION } from "./interpretation";

import { REPORT_INTERPRETATION } from "./interpretation";

/** Stable marker so dependency on Results remains intentional and testable. */
export const RESULTS_LIBRARY_ALIGNMENT = Object.freeze({
  packageName: "@learning-platform/results",
  strengthThreshold: REPORT_INTERPRETATION.strengthThreshold,
  weaknessThreshold: REPORT_INTERPRETATION.weaknessThreshold
});
