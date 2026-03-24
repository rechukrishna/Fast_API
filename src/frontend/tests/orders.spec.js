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

test.describe('Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Orders' }).click()
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({ timeout: 5000 })
  })

  test('displays Orders page with form and list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
    await expect(page.locator('select').first()).toBeVisible()
    await expect(page.locator('select').nth(1)).toBeVisible()
    await expect(page.getByPlaceholder('Qty')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Order' })).toBeVisible()
    await expect(page.locator('.list')).toBeVisible()
  })

  test('displays seeded orders', async ({ page }) => {
    const list = page.locator('.list')
    await expect(list.getByText('Alice Johnson').first()).toBeVisible()
    await expect(list.getByText('Laptop Pro 15').first()).toBeVisible()
    await expect(list.getByText('Bob Smith').first()).toBeVisible()
    await expect(list.getByText('Wireless Headphones').first()).toBeVisible()
  })

  test('user and product dropdowns are populated', async ({ page }) => {
    const userSelect = page.locator('select').first()
    await expect(userSelect.locator('option', { hasText: 'Alice Johnson' })).toHaveCount(1)
    await expect(userSelect.locator('option', { hasText: 'Bob Smith' })).toHaveCount(1)

    const productSelect = page.locator('select').nth(1)
    await expect(productSelect.locator('option', { hasText: 'Laptop Pro 15' })).toHaveCount(1)
    await expect(productSelect.locator('option', { hasText: 'Wireless Headphones' })).toHaveCount(1)
  })

  test('status dropdown has pending, paid, cancelled options', async ({ page }) => {
    const statusSelect = page.locator('select').nth(2)
    await expect(statusSelect.locator('option', { hasText: 'Pending' })).toHaveCount(1)
    await expect(statusSelect.locator('option', { hasText: 'Paid' })).toHaveCount(1)
    await expect(statusSelect.locator('option', { hasText: 'Cancelled' })).toHaveCount(1)
  })

  test('adds new order and shows in list', async ({ page }) => {
    await page.locator('select').first().selectOption({ label: 'Alice Johnson' })
    await page.locator('select').nth(1).selectOption({ label: 'Gaming Mouse' })
    await page.getByPlaceholder('Qty').fill('5')
    await page.locator('select').nth(2).selectOption({ label: 'Paid' })
    await page.getByRole('button', { name: 'Add Order' }).click()

    await expect(
      page.getByText('Alice Johnson × Gaming Mouse — qty 5 (paid)').first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('form clears after adding order', async ({ page }) => {
    await page.locator('select').first().selectOption({ label: 'Bob Smith' })
    await page.locator('select').nth(1).selectOption({ label: 'Smartphone X' })
    await page.getByPlaceholder('Qty').fill('2')
    await page.getByRole('button', { name: 'Add Order' }).click()

    await expect(page.locator('select').first()).toHaveValue('')
    await expect(page.locator('select').nth(1)).toHaveValue('')
    await expect(page.getByPlaceholder('Qty')).toHaveValue('1')
    await expect(page.locator('select').nth(2)).toHaveValue('pending')
  })

  test('orders list shows user × product — qty format', async ({ page }) => {
    const listItems = page.locator('.list li')
    await expect(listItems.first()).toContainText('×')
    await expect(listItems.first()).toContainText('qty')
  })

  test('displays order status in list items', async ({ page }) => {
    const list = page.locator('.list')
    await expect(list.getByText('(paid)').first()).toBeVisible()
    await expect(list.getByText('(pending)').first()).toBeVisible()
    await expect(list.getByText('(cancelled)').first()).toBeVisible()
  })
})
