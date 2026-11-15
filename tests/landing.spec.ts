import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("loads hero section with headline, CTA button, and hero image", async ({ page }) => {
    // Check main headline
    const headline = page.locator("h1");
    await expect(headline).toBeVisible();
    await expect(headline).toContainText("Crop decisions backed by");

    // Check CTA button linking to advice wizard
    const ctaButton = page.getByRole("link", { name: /Get crop advice/i });
    await expect(ctaButton).toBeVisible();

    // Check hero image presence and alt text
    const heroImage = page.locator("img[alt*='Farmer transplanting rice seedlings']");
    await heroImage.scrollIntoViewIfNeeded();
    await expect(heroImage).toBeVisible();
  });

  test("displays problem section with bullock plough image and prose", async ({ page }) => {
    const problemHeading = page.getByRole("heading", { name: /What smallholders face/i });
    await expect(problemHeading).toBeVisible();

    const ploughImage = page.locator("img[alt*='bullock']");
    await expect(ploughImage).toBeVisible();
  });

  test("displays NASA Earth Observation data sources in definition list", async ({ page }) => {
    const dataSection = page.locator("dl");
    await expect(dataSection).toBeVisible();
    await expect(dataSection.getByText("NASA POWER", { exact: true })).toBeVisible();
    await expect(dataSection.getByText("NASA GPM IMERG", { exact: true })).toBeVisible();
    await expect(dataSection.getByText("NASA SMAP Level-4", { exact: true })).toBeVisible();
  });

  test("displays 4-step method and custom hiring machinery note", async ({ page }) => {
    await expect(page.getByText(/Enter field details/i)).toBeVisible();
    await expect(page.getByText(/Read satellite telemetry/i)).toBeVisible();
    await expect(page.getByText(/Score eight crops/i)).toBeVisible();
    await expect(page.getByText(/Receive your farm plan/i)).toBeVisible();

    // Machinery image in stubble management note
    const machineryImage = page.locator("img[alt*='machinery']");
    await expect(machineryImage).toBeVisible();
  });

  test("includes live interactive demo section on homepage", async ({ page }) => {
    const demoHeading = page.getByRole("heading", { name: /Interactive Recommendation Demo/i });
    await expect(demoHeading).toBeVisible();

    // Verify Singur preset button exists and is clickable
    const singurPreset = page.getByRole("button", { name: /Singur/i }).first();
    await expect(singurPreset).toBeVisible();
  });
});
