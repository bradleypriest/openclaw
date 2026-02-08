import type { ApplyAuthChoiceParams } from "../../../commands/auth-choice.apply.js";
import type { AuthChoice, OnboardOptions } from "../../../commands/onboard-types.js";
import type { OpenClawConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";

export type BuiltinProviderContext = {
  accountId?: string;
  gatewayId?: string;
};

export type BuiltinProviderDefaultModel = {
  kind: "standard";
  defaultModel: string;
  noteDefault?: string;
  applyDefaultConfig: (config: OpenClawConfig, context?: BuiltinProviderContext) => OpenClawConfig;
  applyProviderConfig: (config: OpenClawConfig, context?: BuiltinProviderContext) => OpenClawConfig;
};

export type BuiltinInteractiveApiKeySpec = {
  authChoice: string;
  tokenProviders: string[];
  providerId: string;
  profileId: string;
  label: string;
  keyPrompt: string;
  envProvider?: string;
  optionKey?: keyof OnboardOptions;
  resolveContext?: (params: ApplyAuthChoiceParams) => Promise<BuiltinProviderContext>;
  resolveCredentialMetadata?: (
    context?: BuiltinProviderContext,
  ) => Record<string, string> | undefined;
  noteBeforePrompt?: { title: string; message: string };
  validate?: (value: string) => string | undefined;
  normalizeInput?: boolean;
  defaultModel?: BuiltinProviderDefaultModel;
};

export type BuiltinNonInteractiveApiKeySpec = {
  authChoice: AuthChoice;
  providerId: string;
  profileId: string;
  optionKey?: keyof OnboardOptions;
  flagName: string;
  envVar: string;
  applyConfig: (
    config: OpenClawConfig,
    authChoice: AuthChoice,
    metadata?: Record<string, string>,
  ) => OpenClawConfig;
  resolveMetadata?: (opts: OnboardOptions, runtime: RuntimeEnv) => Record<string, string> | null;
};
