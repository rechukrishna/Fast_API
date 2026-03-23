import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const AUTH_KEY = 'fastapi_user'

function App() {
  const [user, setUser] = useState(() => localStorage.getItem(AUTH_KEY))
  const [tab, setTab] = useState('users')

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />
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
          <button className="logout-btn" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main className="main">
        {tab === 'users' && <UsersView apiUrl={API_URL} />}
        {tab === 'products' && <ProductsView apiUrl={API_URL} />}
        {tab === 'orders' && <OrdersView apiUrl={API_URL} />}
      </main>
    </div>
  )
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
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
    localStorage.setItem(AUTH_KEY, email)
    onLogin(email)
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
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  )
}

function UsersView({ apiUrl }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/users`)
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
  }, [apiUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setForm({ name: '', email: '' })
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

function ProductsView({ apiUrl }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/products`)
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
  }, [apiUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
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

function OrdersView({ apiUrl }) {
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
        fetch(`${apiUrl}/orders`),
        fetch(`${apiUrl}/users`),
        fetch(`${apiUrl}/products`),
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
  }, [apiUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(form.user_id, 10),
          product_id: parseInt(form.product_id, 10),
          quantity: parseInt(form.quantity, 10),
          status: form.status,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
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

