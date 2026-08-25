import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("plans.generate", () => {
  it("rejects incomplete planner input before calling Groq", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.plans.generate({
        festival: "D",
        city: "H",
        familySize: 0,
        budget: 0,
        language: "",
        preferences: [],
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts a complete planner payload shape", () => {
    const input = {
      festival: "Diwali",
      city: "Hyderabad, Telangana",
      familySize: 4,
      budget: 15000,
      language: "English",
      preferences: ["Vegetarian", "Traditional rituals"],
    };

    expect(input.familySize).toBeGreaterThan(0);
    expect(input.preferences).toContain("Vegetarian");
  });
});
