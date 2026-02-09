export function isOpenRouterCacheTtlEligibleModel(modelId: string): boolean {
  return modelId.toLowerCase().startsWith("anthropic/");
}
