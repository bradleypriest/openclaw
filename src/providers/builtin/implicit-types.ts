import type { OpenClawConfig } from "../../config/config.js";

type ModelsConfig = NonNullable<OpenClawConfig["models"]>;

export type BuiltinImplicitProviderConfig = NonNullable<ModelsConfig["providers"]>[string];

export type BuiltinAuthProfileLike = {
  type?: string;
  key?: string;
  token?: string;
  metadata?: {
    accountId?: string;
    gatewayId?: string;
  };
};

export type BuiltinAuthStoreLike = {
  profiles: Record<string, BuiltinAuthProfileLike | undefined>;
};
