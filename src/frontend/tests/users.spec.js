// @ts-check
import { test, expect } from '@playwright/test'
import {
  getAuthToken,
  createUsers,
  deleteUsers,
  getUsersTestData,
} from './helpers/test-data.js'

const LOGIN_EMAIL = 'alice@example.com'
const LOGIN_PASSWORD = 'password123'

/** @type {Awaited<ReturnType<typeof createUsers>>} */
let testUsers = []

async function login(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByPlaceholder('Email').fill(LOGIN_EMAIL)
  await page.getByPlaceholder('Password').fill(LOGIN_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page.locator('.header')).toBeVisible({ timeout: 5000 })
}

test.describe('Users Page', () => {
  test.beforeAll(async ({ request }) => {
    const token = await getAuthToken(request)
    const userDefs = getUsersTestData()
    testUsers = await createUsers(request, token, userDefs)
  })

  test.afterAll(async ({ request }) => {
    const token = await getAuthToken(request)
    await deleteUsers(request, token, testUsers)
  })

  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Users' }).click()
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({ timeout: 5000 })
  })

  test('displays Users page with form and list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    await expect(page.getByPlaceholder('Name')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible()
    await expect(page.locator('.list')).toBeVisible()
  })

  test('displays test users', async ({ page }) => {
    expect(testUsers.length).toBeGreaterThan(0)
    for (const u of testUsers) {
      await expect(page.locator('.list').getByText(u.name).first()).toBeVisible()
      await expect(page.locator('.list').getByText(u.email).first()).toBeVisible()
    }
  })

  test('adds new user and shows in list', async ({ page }) => {
    const uniqueEmail = `testuser-${Date.now()}@example.com`
    await page.getByPlaceholder('Name').fill('Test User')
    await page.getByPlaceholder('Email').fill(uniqueEmail)
    await page.getByPlaceholder('Password').fill('testpass123')
    await page.getByRole('button', { name: 'Add User' }).click()

    await expect(page.getByText('Test User').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(uniqueEmail).first()).toBeVisible()
  })

  test('form clears after adding user', async ({ page }) => {
    const uniqueEmail = `newuser-${Date.now()}@example.com`
    await page.getByPlaceholder('Name').fill('New User')
    await page.getByPlaceholder('Email').fill(uniqueEmail)
    await page.getByPlaceholder('Password').fill('secret123')
    await page.getByRole('button', { name: 'Add User' }).click()

    await expect(page.getByPlaceholder('Name')).toHaveValue('')
    await expect(page.getByPlaceholder('Email')).toHaveValue('')
    await expect(page.getByPlaceholder('Password')).toHaveValue('')
  })

  test('shows error when adding user with duplicate email', async ({ page }) => {
    expect(testUsers.length).toBeGreaterThan(0)
    const existingEmail = testUsers[0].email
    await page.getByPlaceholder('Name').fill('Duplicate User')
    await page.getByPlaceholder('Email').fill(existingEmail)
    await page.getByPlaceholder('Password').fill('somepassword')
    await page.getByRole('button', { name: 'Add User' }).click()

    await expect(page.getByText('User with this email already exists')).toBeVisible({
      timeout: 5000,
    })
  })

  test('users list shows name and email format', async ({ page }) => {
    const listItems = page.locator('.list li')
    await expect(listItems.first()).toContainText('—')
  })
})
