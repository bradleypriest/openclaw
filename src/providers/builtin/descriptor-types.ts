export type BuiltinDefaultAuthMode = "aws-sdk";

export type BuiltinSetupTokenProviderSpec = {
  providerId: string;
  label: string;
  confirmMessage: string;
  tokenPrompt: string;
  methodLabel: string;
  methodHint: string;
  validateToken: (value: string) => string | undefined;
};

export type BuiltinProviderTag =
  | "anthropic"
  | "openrouter"
  | "copilot"
  | "openai-family"
  | "google-provider"
  | "google-antigravity"
  | "requires-oauth-project-id"
  | "supports-cache-retention";

export type BuiltinProviderDescriptor = {
  providerId: string;
  auth?: {
    defaultMode?: BuiltinDefaultAuthMode;
    envVarCandidates?: string[];
  };
  runtime?: {
    tags?: BuiltinProviderTag[];
  };
  setup?: {
    token?: Omit<BuiltinSetupTokenProviderSpec, "providerId">;
  };
};

export function defineBuiltinProviderDescriptor(
  descriptor: BuiltinProviderDescriptor,
): BuiltinProviderDescriptor {
  return descriptor;
}
