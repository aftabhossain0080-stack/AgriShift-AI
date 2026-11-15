import { test, expect } from "@playwright/test";

test.describe("Bilingual Language Switcher", () => {
  test("switches from English to Bengali on landing page", async ({ page, isMobile }) => {
    await page.goto("/en");

    if (isMobile) {
      const menuBtn = page.getByRole("button", { name: /Open menu|মেনু খুলুন/i });
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
      }
    }

    // Click Bengali toggle button
    const bnButton = page.getByRole("button", { name: /বাংলা|BN/i }).first();
    await expect(bnButton).toBeVisible();
    await bnButton.click();

    // Verify URL changed to /bn
    await page.waitForURL("**/bn**");
    expect(page.url()).toContain("/bn");

    // Check Bengali copy rendered
    await expect(page.getByText("সারা পৃথিবীর কৃষকদের জন্য নাসার আর্থ অবজারভেশন")).toBeVisible();
  });

  test("switches from Bengali back to English", async ({ page, isMobile }) => {
    await page.goto("/bn");

    if (isMobile) {
      const menuBtn = page.getByRole("button", { name: /Open menu|মেনু খুলুন/i });
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
      }
    }

    // Click English toggle button
    const enButton = page.getByRole("button", { name: /English|EN/i }).first();
    await expect(enButton).toBeVisible();
    await enButton.click();

    // Verify URL changed to /en
    await page.waitForURL("**/en**");
    expect(page.url()).toContain("/en");

    // Check English copy rendered
    await expect(page.getByText("NASA Earth observation for farmers worldwide")).toBeVisible();
  });

  test("preserves path when switching languages on advice page", async ({ page, isMobile }) => {
    await page.goto("/en/advice");

    if (isMobile) {
      const menuBtn = page.getByRole("button", { name: /Open menu|মেনু খুলুন/i });
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
      }
    }

    const bnButton = page.getByRole("button", { name: /বাংলা/i }).first();
    await bnButton.click();

    await page.waitForURL("**/bn/advice**");
    expect(page.url()).toContain("/bn/advice");
  });
});
