import { registerZaiProviderSetupHook } from "./zai/setup.js";

let registered = false;

export function ensureBuiltinProviderSetupHooksRegistered(): void {
  if (registered) {
    return;
  }
  registerZaiProviderSetupHook();
  registered = true;
}
