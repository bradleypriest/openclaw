export type ProviderPluginAutoEnableMapping = {
  pluginId: string;
  providerId: string;
};

export const BUILTIN_PROVIDER_PLUGIN_AUTO_ENABLE_MAPPINGS: ProviderPluginAutoEnableMapping[] = [
  { pluginId: "google-antigravity-auth", providerId: "google-antigravity" },
  { pluginId: "google-gemini-cli-auth", providerId: "google-gemini-cli" },
  { pluginId: "qwen-portal-auth", providerId: "qwen-portal" },
  { pluginId: "copilot-proxy", providerId: "copilot-proxy" },
  { pluginId: "minimax-portal-auth", providerId: "minimax-portal" },
];
