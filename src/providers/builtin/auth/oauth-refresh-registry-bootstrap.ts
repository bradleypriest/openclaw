import { refreshChutesOAuthCredential } from "../chutes/oauth-refresh.js";
import { refreshQwenPortalOAuthCredential } from "../qwen-portal/oauth-refresh.js";
import { registerBuiltinOAuthRefreshHandlers } from "./oauth-refresh-registry-core.js";

let registered = false;

export function ensureBuiltinOAuthRefreshHandlersRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinOAuthRefreshHandlers([
    {
      providerId: "chutes",
      handler: refreshChutesOAuthCredential,
    },
    {
      providerId: "qwen-portal",
      handler: refreshQwenPortalOAuthCredential,
    },
  ]);

  registered = true;
}
