import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { listBuiltinNonInteractiveAuthChoiceFlags } from "../../../providers/builtin/non-interactive/api-key-shortcuts.js";

type AuthChoiceFlag = {
  flag: keyof OnboardOptions;
  authChoice: AuthChoice;
  label: string;
};

const AUTH_CHOICE_FLAG_MAP: ReadonlyArray<AuthChoiceFlag> =
  listBuiltinNonInteractiveAuthChoiceFlags();

export type AuthChoiceInference = {
  choice?: AuthChoice;
  matches: AuthChoiceFlag[];
};

// Infer auth choice from explicit provider API key flags.
export function inferAuthChoiceFromFlags(opts: OnboardOptions): AuthChoiceInference {
  const matches = AUTH_CHOICE_FLAG_MAP.filter(({ flag }) => {
    const value = opts[flag];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return Boolean(value);
  });

  return {
    choice: matches[0]?.authChoice,
    matches,
  };
}
