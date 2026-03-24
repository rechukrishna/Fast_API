// @ts-check
import { test, expect } from '@playwright/test'

const VALID_EMAIL = 'alice@example.com'
const VALID_PASSWORD = 'password123'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('displays login form with required elements', async ({ page }) => {
    await expect(page.locator('.login-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Fast API' })).toBeVisible()
    await expect(page.getByText('Sign in to continue')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('shows "Email is required" when submitting with empty email', async ({ page }) => {
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.locator('.login-page')).toBeVisible()
  })

  test('shows "Password is required" when submitting with empty password', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(VALID_EMAIL)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Password is required')).toBeVisible()
    await expect(page.locator('.login-page')).toBeVisible()
  })

  test('shows "Email is required" when submitting with whitespace-only email', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('   ')
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Email is required')).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('invalid@example.com')
    await page.getByPlaceholder('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Incorrect email or password')).toBeVisible()
    await expect(page.locator('.login-page')).toBeVisible()
  })

  test('shows error on valid email but wrong password', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(VALID_EMAIL)
    await page.getByPlaceholder('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Incorrect email or password')).toBeVisible()
  })

  test('successful login navigates to app with Users tab visible', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(VALID_EMAIL)
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('.login-page')).not.toBeVisible()
    await expect(page.locator('.header')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Users' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Products' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Orders' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  })

  test('successful login shows user email in header', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(VALID_EMAIL)
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('.user-email')).toHaveText(VALID_EMAIL)
  })

  test('login with another seeded user succeeds', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('bob@example.com')
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('.header')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.user-email')).toHaveText('bob@example.com')
  })
})
