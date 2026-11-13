import { expect, test, type Page } from '@playwright/test';

const unauthenticatedRefresh = async (page: Page) => {
  await page.route('**/api/v1/auth/refresh', route =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No active session.' }),
    }),
  );
};

test.describe('runtime and platform route access', () => {
  test('redirects an unauthenticated visitor from the application runtime to login', async ({ page }) => {
    await unauthenticatedRefresh(page);

    await page.goto('/applications/application-not-owned/run');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /sign in to your workspace/i })).toBeVisible();
  });

  test('redirects an unauthenticated visitor from platform documentation to login', async ({ page }) => {
    await unauthenticatedRefresh(page);

    await page.goto('/platform/docs');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Work email')).toBeVisible();
  });
});

test.describe('login failure handling', () => {
  test('shows the API error when credentials are rejected', async ({ page }) => {
    await page.route('**/api/v1/auth/login', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password.' }),
      }),
    );

    await page.goto('/login');
    await page.getByLabel('Work email').fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('incorrect-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password.');
    await expect(page).toHaveURL(/\/login$/);
  });
});
