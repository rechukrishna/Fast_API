import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const AUTH_TOKEN_KEY = 'fastapi_token'
const AUTH_USER_KEY = 'fastapi_user'

function getStoredAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const user = localStorage.getItem(AUTH_USER_KEY)
  return token && user ? { token, user } : null
}

function authFetch(url, options, token, onUnauth) {
  const headers = { ...options?.headers, Authorization: `Bearer ${token}` }
  return fetch(url, { ...options, headers }).then((res) => {
    if (res.status === 401) onUnauth()
    return res
  })
}

function App() {
  const [auth, setAuth] = useState(getStoredAuth)
  const [tab, setTab] = useState('users')

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setAuth(null)
  }

  const handleLogin = (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, user)
    setAuth({ token, user })
  }

  if (!auth) {
    return <LoginPage onLogin={handleLogin} apiUrl={API_URL} />
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Fast API</h1>
        <nav>
          {['users', 'products', 'orders'].map((t) => (
            <button
              key={t}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <span className="user-email">{auth.user}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main className="main">
        {tab === 'users' && <UsersView apiUrl={API_URL} token={auth.token} onUnauth={logout} />}
        {tab === 'products' && <ProductsView apiUrl={API_URL} token={auth.token} onUnauth={logout} />}
        {tab === 'orders' && <OrdersView apiUrl={API_URL} token={auth.token} onUnauth={logout} />}
      </main>
    </div>
  )
}

function LoginPage({ onLogin, apiUrl }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.detail || res.statusText || 'Login failed')
        return
      }
      onLogin(data.access_token, data.user?.email ?? email)
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Fast API</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}

function UsersView({ apiUrl, token, onUnauth }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await authFetch(`${apiUrl}/users`, {}, token, onUnauth)
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [apiUrl, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await authFetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      }, token, onUnauth)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || await res.text())
      }
      setForm({ name: '', email: '', password: '' })
      fetchUsers()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="loading">Loading users…</p>
  return (
    <section>
      <h2>Users</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        <button type="submit" disabled={submitting}>Add User</button>
      </form>
      <ul className="list">
        {users.map((u) => (
          <li key={u.id}>{u.name} — {u.email}</li>
        ))}
      </ul>
    </section>
  )
}

function ProductsView({ apiUrl, token, onUnauth }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await authFetch(`${apiUrl}/products`, {}, token, onUnauth)
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [apiUrl, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await authFetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
        }),
      }, token, onUnauth)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || await res.text())
      }
      setForm({ name: '', price: '', stock: '' })
      fetchProducts()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="loading">Loading products…</p>
  return (
    <section>
      <h2>Products</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          required
        />
        <button type="submit" disabled={submitting}>Add Product</button>
      </form>
      <ul className="list">
        {products.map((p) => (
          <li key={p.id}>{p.name} — ${p.price} (stock: {p.stock})</li>
        ))}
      </ul>
    </section>
  )
}

function OrdersView({ apiUrl, token, onUnauth }) {
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ user_id: '', product_id: '', quantity: '1', status: 'pending' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [oRes, uRes, pRes] = await Promise.all([
        authFetch(`${apiUrl}/orders`, {}, token, onUnauth),
        authFetch(`${apiUrl}/users`, {}, token, onUnauth),
        authFetch(`${apiUrl}/products`, {}, token, onUnauth),
      ])
      if (!oRes.ok || !uRes.ok || !pRes.ok) throw new Error('Fetch failed')
      const [o, u, p] = await Promise.all([oRes.json(), uRes.json(), pRes.json()])
      setOrders(o)
      setUsers(u)
      setProducts(p)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [apiUrl, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await authFetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(form.user_id, 10),
          product_id: parseInt(form.product_id, 10),
          quantity: parseInt(form.quantity, 10),
          status: form.status,
        }),
      }, token, onUnauth)
      if (!res.ok) throw new Error((await res.json()).detail || await res.text())
      setForm({ user_id: '', product_id: '', quantity: '1', status: 'pending' })
      fetchAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const userName = (id) => users.find((u) => u.id === id)?.name ?? id
  const productName = (id) => products.find((p) => p.id === id)?.name ?? id

  if (loading) return <p className="loading">Loading orders…</p>
  return (
    <section>
      <h2>Orders</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <select
          value={form.user_id}
          onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
          required
        >
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={String(u.id)}>{u.name}</option>
          ))}
        </select>
        <select
          value={form.product_id}
          onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
          required
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.name}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Qty"
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          required
        />
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" disabled={submitting}>Add Order</button>
      </form>
      <ul className="list">
        {orders.map((o) => (
          <li key={o.id}>
            {userName(o.user_id)} × {productName(o.product_id)} — qty {o.quantity} ({o.status})
          </li>
        ))}
      </ul>
    </section>
  )
}

export default App