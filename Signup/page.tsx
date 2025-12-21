'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'customer' | 'driver'>('customer')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          role,
          full_name: fullName.trim(),
        },
      },
    })

    if (error) {
      setMsg(error.message)
      setLoading(false)
      return
    }

    // If email confirmations are ON, session may be null until confirmed
    if (!data.session) {
      setMsg('Signup created. Check your email to confirm, then login.')
      setLoading(false)
      return
    }

    window.location.href = '/app'
  }

  return (
    <main style={{ padding: 24, maxWidth: 460, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Sign up</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label>
          Full name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </label>

        <label>
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'customer' | 'driver')}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
          </select>
        </label>

        {msg ? (
          <div style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: 10, borderRadius: 8 }}>
            {msg}
          </div>
        ) : null}

        <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 10, border: '1px solid #111' }}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </main>
  )
}
