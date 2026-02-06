import type { OpenClawConfig } from "../../config/config.js";
import type { RuntimeEnv } from "../../runtime.js";
import type { AuthChoice, OnboardOptions } from "../onboard-types.js";
import { normalizeProviderId } from "../../agents/model-selection.js";
import { formatCliCommand } from "../../cli/command-format.js";
import { resolveGatewayPort, writeConfigFile } from "../../config/config.js";
import { logConfigUpdated } from "../../config/logging.js";
import { DEFAULT_GATEWAY_DAEMON_RUNTIME } from "../daemon-runtime.js";
import { healthCommand } from "../health.js";
import {
  applyWizardMetadata,
  DEFAULT_WORKSPACE,
  ensureWorkspaceAndSessions,
  resolveControlUiLinks,
  waitForGatewayReachable,
} from "../onboard-helpers.js";
import {
  installCommunityProviderFromNpm,
  resolveInstalledCommunityProviderAuthChoice,
} from "../onboarding/provider-install.js";
import { inferAuthChoiceFromFlags } from "./local/auth-choice-inference.js";
import { applyNonInteractiveAuthChoice } from "./local/auth-choice.js";
import { installGatewayDaemonNonInteractive } from "./local/daemon-install.js";
import { applyNonInteractiveGatewayConfig } from "./local/gateway-config.js";
import { logNonInteractiveOnboardingJson } from "./local/output.js";
import { applyNonInteractiveSkillsConfig } from "./local/skills-config.js";
import { resolveNonInteractiveWorkspaceDir } from "./local/workspace.js";

type ParsedProviderShortcut = {
  installProvider?: string;
  providerId: string;
};

function parseProviderShortcut(raw: string): ParsedProviderShortcut | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  const separator = value.lastIndexOf(":");
  if (separator < 0) {
    return { providerId: value };
  }

  if (separator === 0 || separator === value.length - 1) {
    return null;
  }

  const npmSpec = value.slice(0, separator).trim();
  const providerId = value.slice(separator + 1).trim();
  if (!npmSpec || !providerId) {
    return null;
  }

  return {
    installProvider: npmSpec,
    providerId,
  };
}

export async function runNonInteractiveOnboardingLocal(params: {
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
}) {
  const { opts, runtime, baseConfig } = params;
  const mode = "local" as const;

  const legacyTokenProvider = opts.tokenProvider?.trim();
  const explicitProviderRaw = opts.provider?.trim();
  const providerInputRaw = explicitProviderRaw ?? legacyTokenProvider;
  const providerShortcut = explicitProviderRaw
    ? parseProviderShortcut(explicitProviderRaw)
    : undefined;
  if (explicitProviderRaw && !providerShortcut) {
    runtime.error(
      `Invalid --provider value "${explicitProviderRaw}". Use <provider-id> or <npm-package>:<provider-id>.`,
    );
    runtime.exit(1);
    return;
  }

  if (providerShortcut) {
    opts.provider = providerShortcut.providerId;
  } else if (legacyTokenProvider && !opts.provider?.trim()) {
    opts.provider = legacyTokenProvider;
  }

  if (legacyTokenProvider && opts.provider?.trim()) {
    const normalizedLegacy = normalizeProviderId(legacyTokenProvider);
    const normalizedProvider = normalizeProviderId(opts.provider);
    if (normalizedLegacy !== normalizedProvider) {
      runtime.error(
        `Conflicting provider ids: --token-provider ${legacyTokenProvider} vs --provider ${opts.provider}.`,
      );
      runtime.exit(1);
      return;
    }
  }

  const resolvedProviderId = opts.provider?.trim();
  const apiKeyShortcut = opts.apiKey?.trim();
  if (apiKeyShortcut) {
    const existingToken = opts.token?.trim();
    if (existingToken && existingToken !== apiKeyShortcut) {
      runtime.error("Conflicting key values: --token and --api-key differ.");
      runtime.exit(1);
      return;
    }
    opts.token = apiKeyShortcut;

    const provider = normalizeProviderId(resolvedProviderId ?? "");
    if (provider === "anthropic") {
      opts.anthropicApiKey ??= apiKeyShortcut;
    } else if (provider === "openai") {
      opts.openaiApiKey ??= apiKeyShortcut;
    } else if (provider === "openrouter") {
      opts.openrouterApiKey ??= apiKeyShortcut;
    } else if (provider === "vercel-ai-gateway") {
      opts.aiGatewayApiKey ??= apiKeyShortcut;
    } else if (provider === "cloudflare-ai-gateway") {
      opts.cloudflareAiGatewayApiKey ??= apiKeyShortcut;
    } else if (provider === "moonshot") {
      opts.moonshotApiKey ??= apiKeyShortcut;
    } else if (provider === "kimi-code" || provider === "kimi-coding") {
      opts.kimiCodeApiKey ??= apiKeyShortcut;
    } else if (provider === "google") {
      opts.geminiApiKey ??= apiKeyShortcut;
    } else if (provider === "zai") {
      opts.zaiApiKey ??= apiKeyShortcut;
    } else if (provider === "xiaomi") {
      opts.xiaomiApiKey ??= apiKeyShortcut;
    } else if (provider === "xai") {
      opts.xaiApiKey ??= apiKeyShortcut;
    } else if (provider === "synthetic") {
      opts.syntheticApiKey ??= apiKeyShortcut;
    } else if (provider === "venice") {
      opts.veniceApiKey ??= apiKeyShortcut;
    } else if (provider === "minimax") {
      opts.minimaxApiKey ??= apiKeyShortcut;
    } else if (provider === "opencode") {
      opts.opencodeZenApiKey ??= apiKeyShortcut;
    }
  }

  const workspaceDir = resolveNonInteractiveWorkspaceDir({
    opts,
    baseConfig,
    defaultWorkspaceDir: DEFAULT_WORKSPACE,
  });

  let nextConfig: OpenClawConfig = {
    ...baseConfig,
    agents: {
      ...baseConfig.agents,
      defaults: {
        ...baseConfig.agents?.defaults,
        workspace: workspaceDir,
      },
    },
    gateway: {
      ...baseConfig.gateway,
      mode: "local",
    },
  };

  let installedProviderAuthChoice: AuthChoice | undefined;
  const installProviderSpec = providerShortcut?.installProvider;
  if (installProviderSpec) {
    runtime.log(`Installing community provider: ${installProviderSpec}`);
    const installResult = await installCommunityProviderFromNpm({
      npmSpec: installProviderSpec,
      config: nextConfig,
      workspaceDir,
      logger: {
        info: (message) => runtime.log(message),
        warn: (message) => runtime.log(message),
      },
    });
    if (!installResult.ok) {
      runtime.error(`Failed to install ${installProviderSpec}: ${installResult.error}`);
      runtime.exit(1);
      return;
    }

    const resolvedAuthChoice = resolveInstalledCommunityProviderAuthChoice({
      authChoices: installResult.authChoices,
      provider: resolvedProviderId,
    });
    if (!opts.authChoice && !resolvedAuthChoice) {
      runtime.error(
        [
          `Installed ${installResult.pluginName}, but it declares multiple API-key providers.`,
          "Pass --provider <npm-package>:<provider-id> or --auth-choice plugin-auth:<...> to disambiguate.",
          `Discovered: ${installResult.authChoices.map((choice) => `${choice.label} (${choice.authChoice})`).join(", ")}`,
        ].join("\n"),
      );
      runtime.exit(1);
      return;
    }

    if (resolvedAuthChoice) {
      installedProviderAuthChoice = resolvedAuthChoice.authChoice as AuthChoice;
    }
    runtime.log(
      `Installed ${installResult.pluginName}. Found provider auth: ${installResult.authChoices
        .map((choice) => choice.label)
        .join(", ")}`,
    );
  }

  const providerShortcutRequested = Boolean(
    providerInputRaw || apiKeyShortcut || legacyTokenProvider,
  );
  if (providerShortcutRequested && !resolvedProviderId && !opts.authChoice) {
    runtime.error(
      "Missing provider id. Use --provider <provider-id> or <npm-package>:<provider-id>.",
    );
    runtime.exit(1);
    return;
  }

  const inferredProviderAuthChoice =
    !opts.authChoice && !installedProviderAuthChoice
      ? providerShortcutRequested && resolvedProviderId
        ? ("apiKey" as const)
        : undefined
      : undefined;

  if (
    providerShortcutRequested &&
    !opts.authChoice &&
    !installedProviderAuthChoice &&
    !inferredProviderAuthChoice
  ) {
    runtime.error(`Could not resolve provider input "${providerInputRaw ?? opts.provider}".`);
    runtime.exit(1);
    return;
  }

  const inferredAuthChoice = inferAuthChoiceFromFlags(opts);
  if (!opts.authChoice && !installedProviderAuthChoice && inferredAuthChoice.matches.length > 1) {
    runtime.error(
      [
        "Multiple API key flags were provided for non-interactive onboarding.",
        "Use a single provider flag or pass --auth-choice explicitly.",
        `Flags: ${inferredAuthChoice.matches.map((match) => match.label).join(", ")}`,
      ].join("\n"),
    );
    runtime.exit(1);
    return;
  }
  const authChoice =
    opts.authChoice ??
    installedProviderAuthChoice ??
    inferredProviderAuthChoice ??
    inferredAuthChoice.choice ??
    "skip";
  const nextConfigAfterAuth = await applyNonInteractiveAuthChoice({
    nextConfig,
    authChoice,
    opts,
    runtime,
    baseConfig,
  });
  if (!nextConfigAfterAuth) {
    return;
  }
  nextConfig = nextConfigAfterAuth;

  const gatewayBasePort = resolveGatewayPort(baseConfig);
  const gatewayResult = applyNonInteractiveGatewayConfig({
    nextConfig,
    opts,
    runtime,
    defaultPort: gatewayBasePort,
  });
  if (!gatewayResult) {
    return;
  }
  nextConfig = gatewayResult.nextConfig;

  nextConfig = applyNonInteractiveSkillsConfig({ nextConfig, opts, runtime });

  nextConfig = applyWizardMetadata(nextConfig, { command: "onboard", mode });
  await writeConfigFile(nextConfig);
  logConfigUpdated(runtime);

  await ensureWorkspaceAndSessions(workspaceDir, runtime, {
    skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap),
  });

  await installGatewayDaemonNonInteractive({
    nextConfig,
    opts,
    runtime,
    port: gatewayResult.port,
    gatewayToken: gatewayResult.gatewayToken,
  });

  const daemonRuntimeRaw = opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
  if (!opts.skipHealth) {
    const links = resolveControlUiLinks({
      bind: gatewayResult.bind as "auto" | "lan" | "loopback" | "custom" | "tailnet",
      port: gatewayResult.port,
      customBindHost: nextConfig.gateway?.customBindHost,
      basePath: undefined,
    });
    await waitForGatewayReachable({
      url: links.wsUrl,
      token: gatewayResult.gatewayToken,
      deadlineMs: 15_000,
    });
    await healthCommand({ json: false, timeoutMs: 10_000 }, runtime);
  }

  logNonInteractiveOnboardingJson({
    opts,
    runtime,
    mode,
    workspaceDir,
    authChoice,
    gateway: {
      port: gatewayResult.port,
      bind: gatewayResult.bind,
      authMode: gatewayResult.authMode,
      tailscaleMode: gatewayResult.tailscaleMode,
    },
    installDaemon: Boolean(opts.installDaemon),
    daemonRuntime: opts.installDaemon ? daemonRuntimeRaw : undefined,
    skipSkills: Boolean(opts.skipSkills),
    skipHealth: Boolean(opts.skipHealth),
  });

  if (!opts.json) {
    runtime.log(
      `Tip: run \`${formatCliCommand("openclaw configure --section web")}\` to store your Brave API key for web_search. Docs: https://docs.openclaw.ai/tools/web`,
    );
  }
}
