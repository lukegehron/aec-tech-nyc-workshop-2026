#!/usr/bin/env node

// Seed Cline (IDE + shared ~/.cline data) so a Codespace boots with OpenRouter
// BYOK and auto-approve already on. Cline stores this as JSON under ~/.cline/data/
// rather than VS Code settings.json.
// https://docs.cline.bot/getting-started/config
// https://docs.cline.bot/features/auto-approve

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = os.homedir();
const apiKey = process.env.OPENROUTER_API_KEY ?? "";
const defaultModel = "anthropic/claude-sonnet-5.5";
// Cline treats a missing reasoning effort as "none". Seed medium, but only when
// unset: this script re-runs on every attach and must not undo an attendee's pick.
const defaultReasoningEffort = "medium";
const now = new Date().toISOString();

const autoApprovalSettings = {
  version: 1,
  enabled: true,
  favorites: [],
  maxRequests: 20,
  actions: {
    readFiles: true,
    readFilesExternally: false,
    editFiles: true,
    editFilesExternally: false,
    executeSafeCommands: true,
    executeAllCommands: true,
    useBrowser: false,
    useMcp: true,
  },
  enableNotifications: false,
};

const clineDir = path.join(home, ".cline");
const dataDir = path.join(clineDir, "data");
const settingsDir = path.join(dataDir, "settings");

fs.mkdirSync(settingsDir, { recursive: true });
fs.chmodSync(clineDir, 0o700);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function writeJson(filePath, value, mode = 0o600) {
  const tmpPath = `${filePath}.tmp.${process.pid}.json`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode,
  });
  fs.renameSync(tmpPath, filePath);
  fs.chmodSync(filePath, mode);
}

function mergeJson(filePath, patch, mode = 0o600) {
  writeJson(filePath, { ...readJson(filePath), ...patch }, mode);
}

const globalStatePath = path.join(dataDir, "globalState.json");
const existingGlobalState = readJson(globalStatePath);
mergeJson(globalStatePath, {
  planModeReasoningEffort:
    existingGlobalState.planModeReasoningEffort ?? defaultReasoningEffort,
  actModeReasoningEffort:
    existingGlobalState.actModeReasoningEffort ?? defaultReasoningEffort,
  welcomeViewCompleted: true,
  isNewUser: false,
  mode: "act",
  telemetrySetting: "disabled",
  planActSeparateModelsSetting: false,
  planModeApiProvider: "openrouter",
  actModeApiProvider: "openrouter",
  planModeOpenRouterModelId: defaultModel,
  actModeOpenRouterModelId: defaultModel,
  autoApprovalSettings,
  yoloModeToggled: true,
  autoApproveAllToggled: true,
});

const secretsPath = path.join(dataDir, "secrets.json");
mergeJson(secretsPath, {
  openRouterApiKey: apiKey,
});

const providersPath = path.join(settingsDir, "providers.json");
const existingProviders = readJson(providersPath);
// The UI stores the picker as { enabled, effort }; picking "none" leaves
// { enabled: false }, so an existing object means the attendee chose.
const existingReasoning =
  existingProviders.providers?.openrouter?.settings?.reasoning;
writeJson(providersPath, {
  ...existingProviders,
  version: existingProviders.version ?? 1,
  lastUsedProvider: "openrouter",
  providers: {
    ...(existingProviders.providers ?? {}),
    openrouter: {
      settings: {
        provider: "openrouter",
        apiKey,
        model: defaultModel,
        reasoning: existingReasoning ?? {
          enabled: true,
          effort: defaultReasoningEffort,
        },
        timeout: 30000,
      },
      updatedAt: now,
      tokenSource: "manual",
    },
  },
});

const globalSettingsPath = path.join(settingsDir, "global-settings.json");
mergeJson(globalSettingsPath, {
  telemetryOptOut: true,
  autoUpdateEnabled: false,
  planActMode: "act",
  toolAutoApprove: true,
});
