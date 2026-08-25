import { describe, expect, it } from "vitest";

describe("GROQ_API_KEY configuration", () => {
  it("authenticates against Groq models endpoint", async () => {
    const apiKey = process.env.GROQ_API_KEY;
    expect(apiKey, "GROQ_API_KEY must be configured for AI generation").toBeTruthy();

    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status).toBe(200);
  }, 15_000);
});
