import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const QIANFAN_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "qianfan",
  auth: {
    envVarCandidates: ["QIANFAN_API_KEY"],
  },
});
