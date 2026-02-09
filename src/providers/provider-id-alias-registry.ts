import { registerKimiCodingProviderAliases } from "./builtin/kimi-coding/provider-aliases.js";
import { registerOpencodeProviderAliases } from "./builtin/opencode/provider-aliases.js";
import { registerQwenPortalProviderAliases } from "./builtin/qwen-portal/provider-aliases.js";
import { registerZaiProviderAliases } from "./builtin/zai/provider-aliases.js";

let registered = false;

export function ensureProviderIdAliasesRegistered(): void {
  if (registered) {
    return;
  }

  registerZaiProviderAliases();
  registerOpencodeProviderAliases();
  registerQwenPortalProviderAliases();
  registerKimiCodingProviderAliases();
  registered = true;
}
