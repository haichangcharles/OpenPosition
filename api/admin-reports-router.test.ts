import { describe, expect, test } from "vitest";
import { buildDismissReportData, buildResolveReportData } from "./admin-reports-router.js";

describe("admin report lifecycle helpers", () => {
  test("resolving a report records resolver metadata", () => {
    expect(buildResolveReportData(12)).toMatchObject({
      status: "resolved",
      resolvedBy: 12,
    });
  });

  test("dismissing a report records resolver metadata", () => {
    expect(buildDismissReportData(14)).toMatchObject({
      status: "dismissed",
      resolvedBy: 14,
    });
  });
});
