/** Pilot Reports SPA configuration. Publishable key only — never service role. */
export const APP_CONFIG = Object.freeze({
  appName: "Learner Reports",
  pilotHubCode: "unit-3-cyber-security",
  pilotHubTitle: "Cyber Security",
  qualification: "OCR Level 3 IT — Unit 3",
  theme: Object.freeze({
    primary: "#0b1f33",
    accent: "#0d7a8c",
    surface: "#f7fafb",
    text: "#12202c",
    muted: "#4d5d6b",
    border: "#d5dee5",
    danger: "#8a1f1f",
    success: "#1f6b43"
  }),
  supabase: Object.freeze({
    projectUrl: "https://hubwpkrqndorznwzvaer.supabase.co",
    /** Same publishable key used by learner hubs. Not a service-role secret. */
    publishableKey: "sb_publishable_SlcVwn-vjm-hTUZlC_UH7g_V3GedixM",
    /** Separate storage key so Reports does not redesign shared hub auth. */
    authStorageKey: "sb-hubwpkrqndorznwzvaer-auth-token--learner-reports"
  })
});

export type AppConfig = typeof APP_CONFIG;
