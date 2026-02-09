import { normalizeProviderId } from "../../provider-id.js";

const MISTRAL_MODEL_HINTS = [
  "mistral",
  "mixtral",
  "codestral",
  "pixtral",
  "devstral",
  "ministral",
  "mistralai",
];

export function isMistralTranscriptModel(params: {
  provider?: string | null;
  modelId?: string | null;
}): boolean {
  const provider = normalizeProviderId(params.provider ?? "");
  if (provider === "mistral") {
    return true;
  }
  const modelId = (params.modelId ?? "").toLowerCase();
  if (!modelId) {
    return false;
  }
  return MISTRAL_MODEL_HINTS.some((hint) => modelId.includes(hint));
}
