// @ts-check
import { test, expect } from '@playwright/test'

const VALID_EMAIL = 'alice@example.com'
const VALID_PASSWORD = 'password123'

async function login(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByPlaceholder('Email').fill(VALID_EMAIL)
  await page.getByPlaceholder('Password').fill(VALID_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page.locator('.header')).toBeVisible({ timeout: 5000 })
}

test.describe('Products Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Products' }).click()
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 5000 })
  })

  test('displays Products page with form and list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
    await expect(page.getByPlaceholder('Name')).toBeVisible()
    await expect(page.getByPlaceholder('Price')).toBeVisible()
    await expect(page.getByPlaceholder('Stock')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Product' })).toBeVisible()
    await expect(page.locator('.list')).toBeVisible()
  })

  test('displays seeded products', async ({ page }) => {
    const list = page.locator('.list')
    await expect(list.getByText('Laptop Pro 15').first()).toBeVisible()
    await expect(list.getByText('Wireless Headphones').first()).toBeVisible()
    await expect(list.getByText('Smartphone X').first()).toBeVisible()
  })

  test('adds new product and shows in list', async ({ page }) => {
    const uniqueName = `Test Product ${Date.now()}`
    await page.getByPlaceholder('Name').fill(uniqueName)
    await page.getByPlaceholder('Price').fill('99.99')
    await page.getByPlaceholder('Stock').fill('25')
    await page.getByRole('button', { name: 'Add Product' }).click()

    const newProductRow = page.locator('.list li', { hasText: uniqueName })
    await expect(newProductRow).toBeVisible({ timeout: 5000 })
    await expect(newProductRow).toContainText('$99.99')
    await expect(newProductRow).toContainText('(stock: 25)')
  })

  test('form clears after adding product', async ({ page }) => {
    const uniqueName = `New Product ${Date.now()}`
    await page.getByPlaceholder('Name').fill(uniqueName)
    await page.getByPlaceholder('Price').fill('49.50')
    await page.getByPlaceholder('Stock').fill('10')
    await page.getByRole('button', { name: 'Add Product' }).click()

    await expect(page.getByPlaceholder('Name')).toHaveValue('')
    await expect(page.getByPlaceholder('Price')).toHaveValue('')
    await expect(page.getByPlaceholder('Stock')).toHaveValue('')
  })

  test('products list shows name — price (stock) format', async ({ page }) => {
    const listItems = page.locator('.list li')
    await expect(listItems.first()).toContainText('—')
    await expect(listItems.first()).toContainText('stock:')
  })
})
