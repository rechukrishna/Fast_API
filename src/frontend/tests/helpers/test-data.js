// @ts-check
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const API_URL = process.env.API_URL || 'http://localhost:8000'

/** @typedef {{ id: number, name: string, email: string }} User */
/** @typedef {{ id: number, name: string, price: number, stock: number }} Product */
/** @typedef {{ id: number, user_id: number, product_id: number, quantity: number, status: string }} Order */

/**
 * Get auth token for login user (from seed)
 * @param {import('@playwright/test').APIRequestContext} request
 * @returns {Promise<string>}
 */
export async function getAuthToken(request) {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: 'alice@example.com', password: 'password123' },
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {{ name: string, email: string, password: string }[]} users
 * @returns {Promise<User[]>}
 */
export async function createUsers(request, token, users) {
  const created = []
  for (const u of users) {
    const res = await request.post(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: u,
    })
    if (!res.ok) throw new Error(`Create user failed: ${await res.text()}`)
    created.push(await res.json())
  }
  return created
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {{ name: string, price: number, stock: number }[]} products
 * @returns {Promise<Product[]>}
 */
export async function createProducts(request, token, products) {
  const created = []
  for (const p of products) {
    const res = await request.post(`${API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: p,
    })
    if (!res.ok) throw new Error(`Create product failed: ${await res.text()}`)
    created.push(await res.json())
  }
  return created
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {{ user_id: number, product_id: number, quantity: number, status: string }[]} orders
 * @returns {Promise<Order[]>}
 */
export async function createOrders(request, token, orders) {
  const created = []
  for (const o of orders) {
    const res = await request.post(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: o,
    })
    if (!res.ok) throw new Error(`Create order failed: ${await res.text()}`)
    created.push(await res.json())
  }
  return created
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {User[]} users
 */
export async function deleteUsers(request, token, users) {
  const headers = { Authorization: `Bearer ${token}` }
  for (const u of users) {
    try {
      const res = await request.delete(`${API_URL}/users/${u.id}`, { headers })
      if (!res.ok) console.warn(`Delete user ${u.id} failed: ${res.status}`)
    } catch (err) {
      console.warn(`Delete user ${u.id} error:`, err?.message)
    }
  }
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {Product[]} products
 */
export async function deleteProducts(request, token, products) {
  const headers = { Authorization: `Bearer ${token}` }
  for (const p of products) {
    try {
      const res = await request.delete(`${API_URL}/products/${p.id}`, { headers })
      if (!res.ok) console.warn(`Delete product ${p.id} failed: ${res.status}`)
    } catch (err) {
      console.warn(`Delete product ${p.id} error:`, err?.message)
    }
  }
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {Order[]} orders
 */
export async function deleteOrders(request, token, orders) {
  const headers = { Authorization: `Bearer ${token}` }
  for (const o of orders) {
    try {
      const res = await request.delete(`${API_URL}/orders/${o.id}`, { headers })
      if (!res.ok) console.warn(`Delete order ${o.id} failed: ${res.status}`)
    } catch (err) {
      console.warn(`Delete order ${o.id} error:`, err?.message)
    }
  }
}

/**
 * Delete all orders that reference the given user IDs (needed before deleting users with FK)
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {number[]} userIds
 */
export async function deleteOrdersByUserIds(request, token, userIds) {
  try {
    const res = await request.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const orders = await res.json()
    const toDelete = orders.filter((o) => userIds.includes(o.user_id))
    await deleteOrders(request, token, toDelete)
  } catch (err) {
    console.warn('deleteOrdersByUserIds error:', err?.message)
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersTemplate = JSON.parse(
  readFileSync(path.resolve(__dirname, '../test-data/users.json'), 'utf-8')
)
const productsTemplate = JSON.parse(
  readFileSync(path.resolve(__dirname, '../test-data/products.json'), 'utf-8')
)
const ordersUsersTemplate = JSON.parse(
  readFileSync(path.resolve(__dirname, '../test-data/orders-users.json'), 'utf-8')
)
const ordersProductsTemplate = JSON.parse(
  readFileSync(path.resolve(__dirname, '../test-data/orders-products.json'), 'utf-8')
)

/** Unique suffix to avoid conflicts across runs */
const RUN_ID = Date.now()

/** Test user definitions for users suite */
export function getUsersTestData() {
  return usersTemplate.map((u) => ({
    name: u.name,
    email: `${u.emailPrefix}-${RUN_ID}@test.example.com`,
    password: u.password,
  }))
}

/** Test product definitions for products suite */
export function getProductsTestData() {
  return productsTemplate.map((p) => ({
    name: `${p.namePrefix}-${RUN_ID}`,
    price: p.price,
    stock: p.stock,
  }))
}

/** Test user definitions for orders suite (unique names to avoid conflict with users suite) */
export function getOrdersUsersTestData() {
  return ordersUsersTemplate.map((u) => ({
    name: u.name,
    email: `${u.emailPrefix}-${RUN_ID}@test.example.com`,
    password: u.password,
  }))
}

/** Test product definitions for orders suite (unique names to avoid conflict with products suite) */
export function getOrdersProductsTestData() {
  return ordersProductsTemplate.map((p) => ({
    name: `${p.namePrefix}-${RUN_ID}`,
    price: p.price,
    stock: p.stock,
  }))
}
