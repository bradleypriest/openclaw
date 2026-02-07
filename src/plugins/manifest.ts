import fs from "node:fs";
import path from "node:path";
import type { PluginConfigUiHint, PluginKind } from "./types.js";
import { MANIFEST_KEY } from "../compat/legacy-names.js";

export const PLUGIN_MANIFEST_FILENAME = "openclaw.plugin.json";
export const PLUGIN_MANIFEST_FILENAMES = [PLUGIN_MANIFEST_FILENAME] as const;

export type PluginManifestProviderAuthMethod =
  | "api-key"
  | "oauth"
  | "token"
  | "device-code"
  | "custom";

export type PluginManifestProviderAuthEntry = {
  method: PluginManifestProviderAuthMethod;
  authChoice?: string;
  label?: string;
  hint?: string;
  group?: string;
  groupLabel?: string;
  groupHint?: string;
  envVars?: string[];
  defaultModel?: string;
  profileId?: string;
  keyPrompt?: string;
};

export type PluginManifest = {
  id: string;
  configSchema: Record<string, unknown>;
  kind?: PluginKind;
  channels?: string[];
  providers?: string[];
  skills?: string[];
  name?: string;
  description?: string;
  version?: string;
  uiHints?: Record<string, PluginConfigUiHint>;
  providerAuth?: Record<string, PluginManifestProviderAuthEntry>;
};

export type PluginManifestLoadResult =
  | { ok: true; manifest: PluginManifest; manifestPath: string }
  | { ok: false; error: string; manifestPath: string };

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const PROVIDER_AUTH_METHODS: PluginManifestProviderAuthMethod[] = [
  "api-key",
  "oauth",
  "token",
  "device-code",
  "custom",
];

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeProviderAuth(
  raw: unknown,
):
  | { ok: true; value: Record<string, PluginManifestProviderAuthEntry> }
  | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: true, value: {} };
  }

  const entries: Record<string, PluginManifestProviderAuthEntry> = {};
  for (const [providerIdRaw, authRaw] of Object.entries(raw)) {
    const providerId = providerIdRaw.trim();
    if (!providerId) {
      return { ok: false, error: "providerAuth keys must be non-empty provider ids" };
    }
    if (!isRecord(authRaw)) {
      return { ok: false, error: `providerAuth.${providerId} must be an object` };
    }

    const methodRaw = normalizeOptionalString(authRaw.method);
    if (!methodRaw) {
      return { ok: false, error: `providerAuth.${providerId}.method is required` };
    }
    if (!PROVIDER_AUTH_METHODS.includes(methodRaw as PluginManifestProviderAuthMethod)) {
      return {
        ok: false,
        error: `providerAuth.${providerId}.method must be one of: ${PROVIDER_AUTH_METHODS.join(", ")}`,
      };
    }

    entries[providerId] = {
      method: methodRaw as PluginManifestProviderAuthMethod,
      authChoice: normalizeOptionalString(authRaw.authChoice),
      label: normalizeOptionalString(authRaw.label),
      hint: normalizeOptionalString(authRaw.hint),
      group: normalizeOptionalString(authRaw.group),
      groupLabel: normalizeOptionalString(authRaw.groupLabel),
      groupHint: normalizeOptionalString(authRaw.groupHint),
      envVars: normalizeStringList(authRaw.envVars),
      defaultModel: normalizeOptionalString(authRaw.defaultModel),
      profileId: normalizeOptionalString(authRaw.profileId),
      keyPrompt: normalizeOptionalString(authRaw.keyPrompt),
    };
  }

  return { ok: true, value: entries };
}

export function resolvePluginManifestPath(rootDir: string): string {
  for (const filename of PLUGIN_MANIFEST_FILENAMES) {
    const candidate = path.join(rootDir, filename);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.join(rootDir, PLUGIN_MANIFEST_FILENAME);
}

export function loadPluginManifest(rootDir: string): PluginManifestLoadResult {
  const manifestPath = resolvePluginManifestPath(rootDir);
  if (!fs.existsSync(manifestPath)) {
    return { ok: false, error: `plugin manifest not found: ${manifestPath}`, manifestPath };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as unknown;
  } catch (err) {
    return {
      ok: false,
      error: `failed to parse plugin manifest: ${String(err)}`,
      manifestPath,
    };
  }
  if (!isRecord(raw)) {
    return { ok: false, error: "plugin manifest must be an object", manifestPath };
  }
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) {
    return { ok: false, error: "plugin manifest requires id", manifestPath };
  }
  const configSchema = isRecord(raw.configSchema) ? raw.configSchema : null;
  if (!configSchema) {
    return { ok: false, error: "plugin manifest requires configSchema", manifestPath };
  }

  const kind = typeof raw.kind === "string" ? (raw.kind as PluginKind) : undefined;
  const name = typeof raw.name === "string" ? raw.name.trim() : undefined;
  const description = typeof raw.description === "string" ? raw.description.trim() : undefined;
  const version = typeof raw.version === "string" ? raw.version.trim() : undefined;
  const channels = normalizeStringList(raw.channels);
  const providers = normalizeStringList(raw.providers);
  const skills = normalizeStringList(raw.skills);
  const providerAuth = normalizeProviderAuth(raw.providerAuth);
  if (!providerAuth.ok) {
    return { ok: false, error: providerAuth.error, manifestPath };
  }

  let uiHints: Record<string, PluginConfigUiHint> | undefined;
  if (isRecord(raw.uiHints)) {
    uiHints = raw.uiHints as Record<string, PluginConfigUiHint>;
  }

  return {
    ok: true,
    manifest: {
      id,
      configSchema,
      kind,
      channels,
      providers,
      skills,
      name,
      description,
      version,
      uiHints,
      providerAuth: providerAuth.value,
    },
    manifestPath,
  };
}

// package.json "openclaw" metadata (used for onboarding/catalog)
export type PluginPackageChannel = {
  id?: string;
  label?: string;
  selectionLabel?: string;
  detailLabel?: string;
  docsPath?: string;
  docsLabel?: string;
  blurb?: string;
  order?: number;
  aliases?: string[];
  preferOver?: string[];
  systemImage?: string;
  selectionDocsPrefix?: string;
  selectionDocsOmitLabel?: boolean;
  selectionExtras?: string[];
  showConfigured?: boolean;
  quickstartAllowFrom?: boolean;
  forceAccountBinding?: boolean;
  preferSessionLookupForAnnounceTarget?: boolean;
};

export type PluginPackageInstall = {
  npmSpec?: string;
  localPath?: string;
  defaultChoice?: "npm" | "local";
};

export type OpenClawPackageManifest = {
  extensions?: string[];
  channel?: PluginPackageChannel;
  install?: PluginPackageInstall;
};

export type ManifestKey = typeof MANIFEST_KEY;

export type PackageManifest = {
  name?: string;
  version?: string;
  description?: string;
} & Partial<Record<ManifestKey, OpenClawPackageManifest>>;

export function getPackageManifestMetadata(
  manifest: PackageManifest | undefined,
): OpenClawPackageManifest | undefined {
  if (!manifest) {
    return undefined;
  }
  return manifest[MANIFEST_KEY];
}
