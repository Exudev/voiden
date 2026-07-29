import { describe, it, expect } from "vitest";
import {
  convertBlocksToVoidFile,
  createMethodNode,
  createUrlNode,
  createHeadersTableNode,
  createQueryTableNode,
} from "../../../../../../../plugins/voiden-rest-api/src/lib/helpers";
import { buildRequest } from "../../../../../../../plugins/voiden-rest-api/src/runner";
import { parseVoidFile } from "../../../../../../../packages/voiden-runner/src/parser";

describe("convertBlocksToVoidFile - runner compatibility", () => {
  it("simplifies raw method, url, and table nodes into runner-compatible format", () => {
    const rawBlocks = [
      {
        type: "request",
        content: [
          createMethodNode("POST"),
          createUrlNode("https://api.example.com/v1/users"),
        ],
      },
      createHeadersTableNode([
        ["Authorization", "Bearer token123"],
        ["Content-Type", "application/json"],
      ]),
      createQueryTableNode([
        ["page", "1"],
        ["limit", "10"],
      ]),
    ];

    const markdownOutput = convertBlocksToVoidFile("Test Request", rawBlocks);

    // 1. Verify markdown output string formatting
    expect(markdownOutput).toContain("# Test Request");
    expect(markdownOutput).toContain("method: POST");
    expect(markdownOutput).toContain("content: https://api.example.com/v1/users");
    expect(markdownOutput).toContain("- Authorization");
    expect(markdownOutput).toContain("- Bearer token123");

    // 2. Parse back via voiden-runner's parser
    const parsedBlocks = parseVoidFile(markdownOutput);
    expect(parsedBlocks.length).toBe(3);

    // 3. Build request using voiden-rest-api's runner buildRequest
    const requestState = buildRequest(parsedBlocks);
    expect(requestState).not.toBeNull();
    expect(requestState?.method).toBe("POST");
    expect(requestState?.url).toBe("https://api.example.com/v1/users");

    expect(requestState?.headers).toEqual([
      { key: "Authorization", value: "Bearer token123", enabled: true },
      { key: "Content-Type", value: "application/json", enabled: true },
    ]);

    expect(requestState?.queryParams).toEqual([
      { key: "page", value: "1", enabled: true },
      { key: "limit", value: "10", enabled: true },
    ]);
  });
});
