import { registerProviderIdAliases } from "../../provider-id-aliases.js";

export function registerOpencodeProviderAliases(): void {
  registerProviderIdAliases({
    "opencode-zen": "opencode",
  });
}
