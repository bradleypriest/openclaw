import { stripThinkingTags } from "../format";

const ENVELOPE_PREFIX = /^\[([^\]]+)\]\s*/;
const ENVELOPE_CHANNELS = [
  "WebChat",
  "WhatsApp",
  "Telegram",
  "Signal",
  "Slack",
  "Discord",
  "iMessage",
  "Teams",
  "Matrix",
  "Zalo",
  "Zalo Personal",
  "BlueBubbles",
];

const textCache = new WeakMap<object, string | null>();
const thinkingCache = new WeakMap<object, string | null>();
const imagesCache = new WeakMap<object, ExtractedImage[]>();

function looksLikeEnvelopeHeader(header: string): boolean {
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\b/.test(header)) return true;
  if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}\b/.test(header)) return true;
  return ENVELOPE_CHANNELS.some((label) => header.startsWith(`${label} `));
}

export function stripEnvelope(text: string): string {
  const match = text.match(ENVELOPE_PREFIX);
  if (!match) return text;
  const header = match[1] ?? "";
  if (!looksLikeEnvelopeHeader(header)) return text;
  return text.slice(match[0].length);
}

export type ExtractedImage = {
  src: string;
  mimeType?: string;
  alt?: string;
};

function pickFirstString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

function normalizeMimeType(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const cleaned = trimmed.split(";")[0]?.trim().toLowerCase();
  return cleaned || undefined;
}

function isAllowedImageSrc(value: string): boolean {
  return (
    /^https?:\/\//i.test(value) ||
    /^data:image\//i.test(value) ||
    /^\/media\//.test(value) ||
    /^blob:/i.test(value)
  );
}

function resolveDataImageSrc(data: string, mimeType?: string): string | null {
  const trimmed = data.trim();
  if (!trimmed) return null;
  if (/^data:/i.test(trimmed)) {
    return /^data:image\//i.test(trimmed) ? trimmed : null;
  }
  if (!mimeType || !mimeType.startsWith("image/")) return null;
  return `data:${mimeType};base64,${trimmed}`;
}

function resolveUrlImageSrc(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return isAllowedImageSrc(trimmed) ? trimmed : null;
}

function resolveImageFromSource(source: Record<string, unknown>): {
  src: string | null;
  mimeType?: string;
} {
  const sourceType = pickFirstString(source.type)?.toLowerCase();
  const sourceMime = normalizeMimeType(
    pickFirstString(source.media_type, source.mediaType, source.mimeType, source.mime_type),
  );
  if (sourceType === "base64") {
    const data = pickFirstString(source.data);
    return {
      src: data ? resolveDataImageSrc(data, sourceMime ?? undefined) : null,
      mimeType: sourceMime,
    };
  }
  if (sourceType === "url") {
    const url = pickFirstString(source.url);
    return { src: resolveUrlImageSrc(url), mimeType: sourceMime };
  }

  const data = pickFirstString(source.data);
  if (data) {
    return {
      src: resolveDataImageSrc(data, sourceMime ?? undefined),
      mimeType: sourceMime,
    };
  }
  const url = pickFirstString(source.url);
  return { src: resolveUrlImageSrc(url), mimeType: sourceMime };
}

function extractImageFromItem(item: Record<string, unknown>): ExtractedImage | null {
  const type = typeof item.type === "string" ? item.type.toLowerCase() : "";
  if (type !== "image" && type !== "input_image" && type !== "image_url") return null;

  const alt = pickFirstString(item.alt, item.title, item.fileName, item.filename, item.name);
  let mimeType = normalizeMimeType(
    pickFirstString(item.mimeType, item.media_type, item.mime_type, item.mediaType),
  );

  if (item.source && typeof item.source === "object") {
    const source = item.source as Record<string, unknown>;
    const resolved = resolveImageFromSource(source);
    if (resolved.mimeType) mimeType = resolved.mimeType;
    if (resolved.src) {
      return { src: resolved.src, mimeType, alt };
    }
  }

  const imageUrlObject =
    item.image_url && typeof item.image_url === "object"
      ? (item.image_url as Record<string, unknown>)
      : null;
  const imageUrl = pickFirstString(
    item.url,
    item.imageUrl,
    item.imageURL,
    typeof item.image_url === "string" ? item.image_url : undefined,
    imageUrlObject?.url,
  );
  const urlSrc = resolveUrlImageSrc(imageUrl);
  if (urlSrc) return { src: urlSrc, mimeType, alt };

  const data = pickFirstString(item.data, item.content, imageUrlObject?.data);
  const dataSrc = data ? resolveDataImageSrc(data, mimeType ?? undefined) : null;
  if (dataSrc) return { src: dataSrc, mimeType, alt };

  return null;
}

export function extractText(message: unknown): string | null {
  const m = message as Record<string, unknown>;
  const role = typeof m.role === "string" ? m.role : "";
  const content = m.content;
  if (typeof content === "string") {
    const processed = role === "assistant" ? stripThinkingTags(content) : stripEnvelope(content);
    return processed;
  }
  if (Array.isArray(content)) {
    const parts = content
      .map((p) => {
        const item = p as Record<string, unknown>;
        if (item.type === "text" && typeof item.text === "string") return item.text;
        return null;
      })
      .filter((v): v is string => typeof v === "string");
    if (parts.length > 0) {
      const joined = parts.join("\n");
      const processed = role === "assistant" ? stripThinkingTags(joined) : stripEnvelope(joined);
      return processed;
    }
  }
  if (typeof m.text === "string") {
    const processed = role === "assistant" ? stripThinkingTags(m.text) : stripEnvelope(m.text);
    return processed;
  }
  return null;
}

export function extractTextCached(message: unknown): string | null {
  if (!message || typeof message !== "object") return extractText(message);
  const obj = message as object;
  if (textCache.has(obj)) return textCache.get(obj) ?? null;
  const value = extractText(message);
  textCache.set(obj, value);
  return value;
}

export function extractThinking(message: unknown): string | null {
  const m = message as Record<string, unknown>;
  const content = m.content;
  const parts: string[] = [];
  if (Array.isArray(content)) {
    for (const p of content) {
      const item = p as Record<string, unknown>;
      if (item.type === "thinking" && typeof item.thinking === "string") {
        const cleaned = item.thinking.trim();
        if (cleaned) parts.push(cleaned);
      }
    }
  }
  if (parts.length > 0) return parts.join("\n");

  // Back-compat: older logs may still have <think> tags inside text blocks.
  const rawText = extractRawText(message);
  if (!rawText) return null;
  const matches = [
    ...rawText.matchAll(
      /<\s*think(?:ing)?\s*>([\s\S]*?)<\s*\/\s*think(?:ing)?\s*>/gi,
    ),
  ];
  const extracted = matches
    .map((m) => (m[1] ?? "").trim())
    .filter(Boolean);
  return extracted.length > 0 ? extracted.join("\n") : null;
}

export function extractThinkingCached(message: unknown): string | null {
  if (!message || typeof message !== "object") return extractThinking(message);
  const obj = message as object;
  if (thinkingCache.has(obj)) return thinkingCache.get(obj) ?? null;
  const value = extractThinking(message);
  thinkingCache.set(obj, value);
  return value;
}

export function extractImages(message: unknown): ExtractedImage[] {
  const m = message as Record<string, unknown>;
  const content = m.content;
  if (!Array.isArray(content)) return [];
  const images: ExtractedImage[] = [];
  for (const entry of content) {
    if (!entry || typeof entry !== "object") continue;
    const item = extractImageFromItem(entry as Record<string, unknown>);
    if (item) images.push(item);
  }
  return images;
}

export function extractImagesCached(message: unknown): ExtractedImage[] {
  if (!message || typeof message !== "object") return extractImages(message);
  const obj = message as object;
  const cached = imagesCache.get(obj);
  if (cached) return cached;
  const value = extractImages(message);
  imagesCache.set(obj, value);
  return value;
}

export function extractRawText(message: unknown): string | null {
  const m = message as Record<string, unknown>;
  const content = m.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const parts = content
      .map((p) => {
        const item = p as Record<string, unknown>;
        if (item.type === "text" && typeof item.text === "string") return item.text;
        return null;
      })
      .filter((v): v is string => typeof v === "string");
    if (parts.length > 0) return parts.join("\n");
  }
  if (typeof m.text === "string") return m.text;
  return null;
}

export function formatReasoningMarkdown(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `_${line}_`);
  return lines.length ? ["_Reasoning:_", ...lines].join("\n") : "";
}
