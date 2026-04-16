import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("JSON Title Handling", () => {
  it("should parse embedded title and data", () => {
    const content = JSON.stringify({
      title: "Test Project",
      data: { key: "value" },
    });
    const parsed = JSON.parse(content);
    expect(parsed.title).toBe("Test Project");
    expect(parsed.data).toEqual({ key: "value" });
  });

  it("should handle normal JSON without title", () => {
    const content = JSON.stringify({ key: "value" });
    const parsed = JSON.parse(content);
    expect(parsed).toEqual({ key: "value" });
    expect("title" in parsed).toBe(false);
  });

  it("should generate correct filename", () => {
    const title = "My Project";
    const expected = `${title} - by json.a1zohosolutions.com.json`;
    expect(expected).toBe("My Project - by json.a1zohosolutions.com.json");
  });

  it("should use default filename when no title", () => {
    const title = "";
    const expected = `${title || "response"} - by json.a1zohosolutions.com.json`;
    expect(expected).toBe("response - by json.a1zohosolutions.com.json");
  });
});
