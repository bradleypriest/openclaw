import {
  resolveAmazonBedrockAwsSdkAuthInfo,
  resolveAwsSdkEnvVarName,
} from "../amazon-bedrock/auth.js";

export type AwsSdkAuthInfo = { mode: "aws-sdk"; source: string };

export function resolvePreferredAwsSdkEnvVarName(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return resolveAwsSdkEnvVarName(env);
}

export function resolveAwsSdkAuthInfo(): AwsSdkAuthInfo {
  return resolveAmazonBedrockAwsSdkAuthInfo();
}
