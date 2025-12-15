import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Iniciar Sesión/);

    // Check form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Iniciar Sesión' })
    ).toBeVisible();
  });

  test('should show registration page', async ({ page }) => {
    await page.goto('/register');

    // Check page elements
    await expect(page.getByText('Crear Cuenta')).toBeVisible();
    await expect(page.getByLabel('Nombre completo')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.getByText('Regístrate').click();
    await expect(page).toHaveURL(/\/register/);

    // Click login link
    await page.getByText('Inicia sesión').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Email field should show validation
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should redirect to login when accessing protected routes', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
