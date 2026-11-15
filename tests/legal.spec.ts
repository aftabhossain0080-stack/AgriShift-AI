import { test, expect } from "@playwright/test";

test.describe("Legal Pages (Terms of Service & Privacy Policy)", () => {
  test("Terms of Service page displays full terms and advisory limitation", async ({ page }) => {
    await page.goto("/en/terms");

    // Heading
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();

    // DRAFT disclaimer banner
    await expect(page.getByText(/DRAFT FOR REVIEW BY A LAWYER/i)).toBeVisible();

    // Specific terms sections
    await expect(page.getByText(/No Warranty on Agronomic Outcomes/i)).toBeVisible();
    await expect(page.getByText(/Non-commercial and Open Access Policy/i)).toBeVisible();
  });

  test("Privacy Policy explains location and field data handling with DRAFT banner", async ({ page }) => {
    await page.goto("/en/privacy");

    // Heading
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();

    // DRAFT banner
    await expect(page.getByText(/DRAFT FOR REVIEW BY A LAWYER/i)).toBeVisible();

    // GPS and field data explanations
    await expect(page.getByText(/Geographic Coordinates and Stateless Processing/i)).toBeVisible();
    await expect(page.getByText(/Field Characteristics and Agronomic Inputs/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Zero Third-Party Advertising/i })).toBeVisible();
  });

  test("Bengali legal pages load with correct locale and draft banner", async ({ page }) => {
    await page.goto("/bn/terms");
    await expect(page.getByText(/DRAFT FOR REVIEW BY A LAWYER/i)).toBeVisible();

    await page.goto("/bn/privacy");
    await expect(page.getByText(/DRAFT FOR REVIEW BY A LAWYER/i)).toBeVisible();
  });
});
