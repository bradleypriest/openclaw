import { describe, expect, it } from "vitest";

import {
  extractText,
  extractTextCached,
  extractThinking,
  extractThinkingCached,
  extractImages,
  extractImagesCached,
} from "./message-extract";

describe("extractTextCached", () => {
  it("matches extractText output", () => {
    const message = {
      role: "assistant",
      content: [{ type: "text", text: "Hello there" }],
    };
    expect(extractTextCached(message)).toBe(extractText(message));
  });

  it("returns consistent output for repeated calls", () => {
    const message = {
      role: "user",
      content: "plain text",
    };
    expect(extractTextCached(message)).toBe("plain text");
    expect(extractTextCached(message)).toBe("plain text");
  });
});

describe("extractThinkingCached", () => {
  it("matches extractThinking output", () => {
    const message = {
      role: "assistant",
      content: [{ type: "thinking", thinking: "Plan A" }],
    };
    expect(extractThinkingCached(message)).toBe(extractThinking(message));
  });

  it("returns consistent output for repeated calls", () => {
    const message = {
      role: "assistant",
      content: [{ type: "thinking", thinking: "Plan A" }],
    };
    expect(extractThinkingCached(message)).toBe("Plan A");
    expect(extractThinkingCached(message)).toBe("Plan A");
  });
});

describe("extractImagesCached", () => {
  it("extracts image data URLs from image blocks", () => {
    const message = {
      role: "user",
      content: [
        {
          type: "image",
          data: "abc=",
          mimeType: "image/png",
          fileName: "dot.png",
        },
      ],
    };
    const expected = extractImages(message);
    expect(extractImagesCached(message)).toEqual(expected);
    expect(expected[0]?.src).toBe("data:image/png;base64,abc=");
  });

  it("extracts input_image base64 source", () => {
    const message = {
      role: "user",
      content: [
        {
          type: "input_image",
          source: {
            type: "base64",
            data: "Zm9v",
            media_type: "image/jpeg",
          },
        },
      ],
    };
    const images = extractImagesCached(message);
    expect(images).toHaveLength(1);
    expect(images[0]?.src).toBe("data:image/jpeg;base64,Zm9v");
  });
});
