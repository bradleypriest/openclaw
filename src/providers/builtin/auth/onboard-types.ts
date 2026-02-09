export type BuiltInAuthChoice =
  | "oauth"
  | "setup-token"
  | "claude-cli"
  | "token"
  | "chutes"
  | "openai-codex"
  | "openai-api-key"
  | "openrouter-api-key"
  | "ai-gateway-api-key"
  | "cloudflare-ai-gateway-api-key"
  | "moonshot-api-key"
  | "moonshot-api-key-cn"
  | "kimi-code-api-key"
  | "synthetic-api-key"
  | "venice-api-key"
  | "codex-cli"
  | "apiKey"
  | "gemini-api-key"
  | "google-antigravity"
  | "google-gemini-cli"
  | "zai-api-key"
  | "xiaomi-api-key"
  | "minimax-cloud"
  | "minimax"
  | "minimax-api"
  | "minimax-api-lightning"
  | "minimax-portal"
  | "opencode-zen"
  | "github-copilot"
  | "copilot-proxy"
  | "qwen-portal"
  | "xai-api-key"
  | "qianfan-api-key"
  | "skip";

export type AuthChoice = BuiltInAuthChoice | `plugin:${string}`;

export type BuiltinOnboardOptions = {
  authChoice?: AuthChoice;
  provider?: string;
  tokenProvider?: string;
  apiKey?: string;
  token?: string;
  tokenProfileId?: string;
  tokenExpiresIn?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  aiGatewayApiKey?: string;
  cloudflareAiGatewayAccountId?: string;
  cloudflareAiGatewayGatewayId?: string;
  cloudflareAiGatewayApiKey?: string;
  moonshotApiKey?: string;
  kimiCodeApiKey?: string;
  geminiApiKey?: string;
  zaiApiKey?: string;
  xiaomiApiKey?: string;
  minimaxApiKey?: string;
  syntheticApiKey?: string;
  veniceApiKey?: string;
  opencodeZenApiKey?: string;
  xaiApiKey?: string;
  qianfanApiKey?: string;
};
