import { describe, expect, it } from "vitest";
import { isExternalCliOAuthProvider } from "./external-cli-providers.js";

describe("isExternalCliOAuthProvider", () => {
  it("resolves via descriptor runtime tags", () => {
    expect(isExternalCliOAuthProvider("qwen-portal")).toBe(true);
    expect(isExternalCliOAuthProvider("minimax-portal")).toBe(true);
    expect(isExternalCliOAuthProvider("openai")).toBe(false);
  });
});
