import { test, expect } from "@playwright/test";

test.describe("Mock Mode & Fallback Resilience", () => {
  test("generates valid recommendations using agronomic fallback when backend offline", async ({ page }) => {
    // Force network failure for backend endpoints
    await page.route("**/api/v1/**", (route) => route.abort("failed"));

    await page.goto("/en/demo");

    // Click Generate Recommendations
    const generateBtn = page.getByRole("button", { name: /Generate Recommendations/i });
    await generateBtn.click();

    // Verify fallback or mock recommendations display
    // Crop cards should appear (Mustard or other top crop)
    await expect(page.getByRole("heading", { name: "Mustard", exact: true }).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Optimal/i).first()).toBeVisible();
  });
});
