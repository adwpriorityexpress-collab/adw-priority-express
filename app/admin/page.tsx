'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

type Profile = {
  id: string
  role: string
  full_name: string | null
  phone: string | null
  approved: boolean | null
  created_at: string | null
}

export default function AdminPage() {
  const [meRole, setMeRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState<Profile[]>([])
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr) {
      setMessage(authErr.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      window.location.href = '/login'
      return
    }

    const { data: me, error: meErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (meErr) {
      setMessage(meErr.message)
      setLoading(false)
      return
    }

    const role = me?.role || ''
    setMeRole(role)

    if (role !== 'admin') {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, approved, created_at')
      .eq('role', 'driver')
      .order('created_at', { ascending: false })

    if (error) setMessage(error.message)
    setDrivers((data as Profile[]) || [])
    setLoading(false)
  }

  async function setApproved(id: string, approved: boolean) {
    setMessage('Updating...')

    const supabase = createClient()

    const { error } = await supabase.from('profiles').update({ approved }).eq('id', id)
    setMessage(error ? error.message : 'Updated ✅')
    await load()
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <main style={{ padding: 20 }}>Loading...</main>

  if (meRole !== 'admin') {
    return (
      <main style={{ padding: 20 }}>
        Not allowed. This page is for admins only.
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Admin — Driver Approvals</h1>
      {message && <p style={{ marginBottom: 12 }}>{message}</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {drivers.map((d) => (
          <div
            key={d.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 10,
              padding: 12,
              display: 'grid',
              gap: 6,
            }}
          >
            <div><b>Name:</b> {d.full_name || '—'}</div>
            <div><b>Phone:</b> {d.phone || '—'}</div>
            <div><b>Approved:</b> {d.approved ? 'Yes ✅' : 'No ⏳'}</div>

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={() => setApproved(d.id, true)} style={{ padding: 10 }}>
                Approve
              </button>
              <button onClick={() => setApproved(d.id, false)} style={{ padding: 10 }}>
                Set Pending
              </button>
            </div>
          </div>
        ))}
        {drivers.length === 0 && <p>No drivers yet.</p>}
      </div>
    </main>
  )
}
