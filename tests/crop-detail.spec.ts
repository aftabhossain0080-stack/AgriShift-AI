import { test, expect } from "@playwright/test";

test.describe("Crop Detail Pages (/crops/[slug])", () => {
  test("displays Mustard agronomic profile with ICAR-DRMR and BCKV references", async ({ page }) => {
    await page.goto("/en/crops/mustard");

    // Check title and botanical name
    await expect(page.getByRole("heading", { name: "Mustard" })).toBeVisible();
    await expect(page.getByText("Brassica juncea")).toBeVisible();

    // Check key agronomic specifications
    await expect(page.getByText("Thermal Range")).toBeVisible();
    await expect(page.getByText("Water Demand")).toBeVisible();
    await expect(page.getByText("Crop Duration")).toBeVisible();

    // Check Package of Practices numbered steps
    await expect(page.getByRole("heading", { name: /Package of Practices/i })).toBeVisible();

    // Check institutional citations
    await expect(page.getByText(/BCKV Directorate of Research/i)).toBeVisible();
  });

  test("displays Potato agronomic profile with CPRI references", async ({ page }) => {
    await page.goto("/en/crops/potato");

    await expect(page.getByRole("heading", { name: "Potato" })).toBeVisible();
    await expect(page.getByText("Solanum tuberosum")).toBeVisible();
    await expect(page.getByText("Central Potato Research Institute")).toBeVisible();
  });

  test("returns 404 for unsupported crop slug", async ({ page }) => {
    const response = await page.goto("/en/crops/unsupported-crop");
    expect(response?.status()).toBe(404);
  });
});
