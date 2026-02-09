import type { Api, Model } from "@mariozechner/pi-ai";

export type ModelCompatNormalizer = (model: Model<Api>) => Model<Api> | undefined;

const modelCompatNormalizers = new Map<string, ModelCompatNormalizer>();

export function registerModelCompatNormalizers(
  normalizers: Array<{ id: string; normalize: ModelCompatNormalizer }>,
): void {
  for (const registration of normalizers) {
    if (!registration.id.trim() || modelCompatNormalizers.has(registration.id)) {
      continue;
    }
    modelCompatNormalizers.set(registration.id, registration.normalize);
  }
}

export function listRegisteredModelCompatNormalizers(): ModelCompatNormalizer[] {
  return [...modelCompatNormalizers.values()];
}
