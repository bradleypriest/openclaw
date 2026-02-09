import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const BUILTIN_PROVIDER_DIR = fileURLToPath(new URL(".", import.meta.url));
const PROVIDER_MARKER_FILES = [
  "api-key.ts",
  "config.ts",
  "models.ts",
  "oauth.ts",
  "implicit-provider.ts",
  "discovery.ts",
  "token.ts",
];

function listProviderLikeDirectories(): string[] {
  return readdirSync(BUILTIN_PROVIDER_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) =>
      PROVIDER_MARKER_FILES.some((file) => existsSync(path.join(BUILTIN_PROVIDER_DIR, name, file))),
    );
}

describe("builtin provider descriptor coverage", () => {
  it("has descriptor.ts for every provider-like builtin module", () => {
    const missing = listProviderLikeDirectories().filter(
      (name) => !existsSync(path.join(BUILTIN_PROVIDER_DIR, name, "descriptor.ts")),
    );
    expect(missing).toEqual([]);
  });
});
