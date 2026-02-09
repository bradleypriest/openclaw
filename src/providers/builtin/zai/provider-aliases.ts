import { registerProviderIdAliases } from "../../provider-id-aliases.js";

export function registerZaiProviderAliases(): void {
  registerProviderIdAliases({
    "z.ai": "zai",
    "z-ai": "zai",
  });
}
