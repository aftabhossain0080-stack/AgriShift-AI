import { test, expect } from "@playwright/test";

test.describe("Results Page (/results)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with Singur query parameters
    await page.goto(
      "/en/results?village=Singur&lat=22.81&lon=88.23&soil=Alluvial&area=2.5&irrigation=true&currentCrop=Potato&prevCrop=Paddy%20(Aman)&season=Rabi"
    );
  });

  test("displays field header and data confidence badge", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Crop Recommendations" })).toBeVisible();
    await expect(page.getByText(/Data confidence/i)).toBeVisible();
    await expect(page.getByText("NASA POWER", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("GPM IMERG", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("SMAP", { exact: true }).first()).toBeVisible();
  });

  test("displays top ranked crop recommendations with 100-point scores", async ({ page }) => {
    // Ranked crops: Mustard, Lentil, Maize
    await expect(page.getByText("Mustard").first()).toBeVisible();

    // Check score badge exists
    const scoreBadge = page.getByText(/\/100/i).first();
    await expect(scoreBadge).toBeVisible();
  });

  test("displays tabs and navigation controls", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /Crops/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Irrigation/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Rotation/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Risks/i })).toBeVisible();
  });

  test("links to crop detail page", async ({ page }) => {
    const detailLink = page.getByRole("link", { name: /View full agronomic profile/i }).first();
    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL("**/crops/**");
      expect(page.url()).toContain("/crops/");
    }
  });
});
