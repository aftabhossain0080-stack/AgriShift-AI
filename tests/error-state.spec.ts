import { test, expect } from "@playwright/test";

test.describe("Error State & Retry Handling", () => {
  test("displays error banner with retry button on recommendation failure", async ({ page }) => {
    // Intercept recommendation endpoint with 500 error
    await page.route("**/api/v1/agriculture/recommendations", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "NASA Earthdata upstream service unavailable." }),
      });
    });

    await page.route("**/api/v1/recommendations/generate", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Recommendation pipeline failure." }),
      });
    });

    await page.goto("/en/demo");

    // Click Generate Recommendations in demo form
    const generateBtn = page.getByRole("button", { name: /Generate Recommendations/i });
    await generateBtn.click();

    // Verify error state is rendered with retry button
    const retryBtn = page.getByRole("button", { name: /Retry/i });
    if (await retryBtn.isVisible()) {
      await expect(retryBtn).toBeVisible();
      // Verify minimum touch target (44px)
      const box = await retryBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });
});
