import { expect, test } from "@playwright/test";

test("creates a session and enables logout", async ({ page }) => {
  await page.route("**/sessions", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ session_token: "token-123", openai_key: "sk-test" }),
    });
  });

  await page.route("**/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    });
  });

  await page.goto("/");

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("OpenAI key").fill("sk-test");
  await page.getByRole("button", { name: /create session/i }).click();

  await expect(page.getByText("Connect your session")).toBeHidden();
  const logoutButton = page.getByRole("button", { name: "Logout" });
  await expect(logoutButton).toBeEnabled();

  await logoutButton.click();
  await expect(page.getByText("Log out?")).toBeVisible();
  await page.getByRole("button", { name: /confirm logout/i }).click();
  await expect(page.getByText("Log out?")).toBeHidden();
});
