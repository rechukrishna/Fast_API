// @ts-check
import { test, expect } from '@playwright/test'
import {
  getAuthToken,
  createUsers,
  createProducts,
  createOrders,
  deleteOrdersByUserIds,
  deleteUsers,
  deleteProducts,
  getOrdersUsersTestData,
  getOrdersProductsTestData,
} from './helpers/test-data.js'

const LOGIN_EMAIL = 'alice@example.com'
const LOGIN_PASSWORD = 'password123'

/** @type {Awaited<ReturnType<typeof createUsers>>} */
let testUsers = []
/** @type {Awaited<ReturnType<typeof createProducts>>} */
let testProducts = []
/** @type {Awaited<ReturnType<typeof createOrders>>} */
let testOrders = []

async function login(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByPlaceholder('Email').fill(LOGIN_EMAIL)
  await page.getByPlaceholder('Password').fill(LOGIN_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page.locator('.header')).toBeVisible({ timeout: 5000 })
}

test.describe('Orders Page', () => {
  test.beforeAll(async ({ request }) => {
    const token = await getAuthToken(request)
    const userDefs = getOrdersUsersTestData()
    const productDefs = getOrdersProductsTestData()
    testUsers = await createUsers(request, token, userDefs)
    testProducts = await createProducts(request, token, productDefs)
    testOrders = await createOrders(request, token, [
      {
        user_id: testUsers[0].id,
        product_id: testProducts[0].id,
        quantity: 1,
        status: 'paid',
      },
      {
        user_id: testUsers[1].id,
        product_id: testProducts[1].id,
        quantity: 2,
        status: 'pending',
      },
      {
        user_id: testUsers[2].id,
        product_id: testProducts[2].id,
        quantity: 1,
        status: 'cancelled',
      },
    ])
  })

  test.afterAll(async ({ request }) => {
    const token = await getAuthToken(request)
    const userIds = testUsers.map((u) => u.id)
    await deleteOrdersByUserIds(request, token, userIds)
    await deleteUsers(request, token, testUsers)
    await deleteProducts(request, token, testProducts)
  })

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

  test('displays test orders', async ({ page }) => {
    const list = page.locator('.list')
    for (const o of testOrders) {
      const userName = testUsers.find((u) => u.id === o.user_id)?.name ?? ''
      const productName = testProducts.find((p) => p.id === o.product_id)?.name ?? ''
      await expect(list.getByText(userName).first()).toBeVisible()
      await expect(list.getByText(productName).first()).toBeVisible()
      await expect(list.getByText(`(${o.status})`).first()).toBeVisible()
    }
  })

  test('user and product dropdowns are populated', async ({ page }) => {
    const userSelect = page.locator('select').first()
    for (const u of testUsers) {
      const opts = userSelect.locator('option', { hasText: u.name })
      expect(await opts.count()).toBeGreaterThanOrEqual(1)
    }

    const productSelect = page.locator('select').nth(1)
    for (const p of testProducts) {
      const opts = productSelect.locator('option', { hasText: p.name })
      expect(await opts.count()).toBeGreaterThanOrEqual(1)
    }
  })

  test('status dropdown has pending, paid, cancelled options', async ({ page }) => {
    const statusSelect = page.locator('select').nth(2)
    await expect(statusSelect.locator('option', { hasText: 'Pending' })).toHaveCount(1)
    await expect(statusSelect.locator('option', { hasText: 'Paid' })).toHaveCount(1)
    await expect(statusSelect.locator('option', { hasText: 'Cancelled' })).toHaveCount(1)
  })

  test('adds new order and shows in list', async ({ page }) => {
    await page.locator('select').first().selectOption({ label: testUsers[0].name })
    await page.locator('select').nth(1).selectOption({ label: testProducts[1].name })
    await page.getByPlaceholder('Qty').fill('5')
    await page.locator('select').nth(2).selectOption({ label: 'Paid' })
    await page.getByRole('button', { name: 'Add Order' }).click()

    const expectedText = `${testUsers[0].name} × ${testProducts[1].name} — qty 5 (paid)`
    await expect(page.getByText(expectedText).first()).toBeVisible({ timeout: 5000 })
  })

  test('form clears after adding order', async ({ page }) => {
    await page.locator('select').first().selectOption({ label: testUsers[1].name })
    await page.locator('select').nth(1).selectOption({ label: testProducts[2].name })
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
