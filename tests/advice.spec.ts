import { test, expect } from "@playwright/test";

test.describe("Farmer Intake Wizard (/advice)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/advice");
  });

  test("displays Step 1 and allows 1-click Singur preset selection", async ({ page }) => {
    await expect(page.getByText("Step 1: Farm Location")).toBeVisible();

    // Check preset is available
    const singurBtn = page.getByRole("button", { name: /Singur, India/i });
    await expect(singurBtn).toBeVisible();

    // Click Singur preset
    await singurBtn.click();

    // Verify coordinates updated
    const locationInput = page.locator("#location-name-input");
    await expect(locationInput).toHaveValue("Singur, India");
  });

  test("validates required coordinates and fields before step progression", async ({ page }) => {
    // Clear location input
    const locationInput = page.locator("#location-name-input");
    await locationInput.fill("");

    // Attempt next step
    const nextBtn = page.getByRole("button", { name: /Continue to Field Details/i });
    await nextBtn.click();

    // Still on Step 1
    await expect(page.getByText("Step 1: Farm Location")).toBeVisible();
  });

  test("completes multi-step progression from Step 1 to Step 2 and navigates to Results", async ({ page }) => {
    // Step 1: Select Singur preset and click Continue
    const singurBtn = page.getByRole("button", { name: /Singur, India/i });
    await singurBtn.click();

    const nextBtn = page.getByRole("button", { name: /Continue to Field Details/i });
    await nextBtn.click();

    // Step 2: Field Details
    await expect(page.getByText("Step 2: Field Details")).toBeVisible();

    // Submit form
    const submitBtn = page.getByRole("button", { name: /Get Recommendations/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Should navigate to /results
    await page.waitForURL("**/results**");
    expect(page.url()).toContain("/results");
  });

  test("back button preserves previously entered values", async ({ page }) => {
    // Fill custom location name on Step 1
    const locationInput = page.locator("#location-name-input");
    await locationInput.fill("Custom Farm");

    // Navigate to Step 2
    const nextBtn = page.getByRole("button", { name: /Continue to Field Details/i });
    await nextBtn.click();
    await expect(page.getByText("Step 2: Field Details")).toBeVisible();

    // Click Back button
    const backBtn = page.getByRole("button", { name: /Back to Location/i });
    await backBtn.click();

    // Verify back on Step 1 with custom value intact
    await expect(page.getByText("Step 1: Farm Location")).toBeVisible();
    await expect(page.locator("#location-name-input")).toHaveValue("Custom Farm");
  });
});

