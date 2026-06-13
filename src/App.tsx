import { useState, useEffect } from 'react'
import { Users, Plus, Phone, Mail, Briefcase, DollarSign, Trash2, Search, Star, Edit2, Save, X } from 'lucide-react'

const ACCENT = '#84cc16'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'lead' | 'inactive'
  value: number
  notes: string
  starred: boolean
  added: string
  tags: string[]
}

const STATUS_COLORS = { active: '#22c55e', lead: '#f59e0b', inactive: '#64748b' }

export default function App() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Client>>({})
  const [filter, setFilter] = useState<'all' | 'active' | 'lead' | 'starred'>('all')

  useEffect(() => {
    const saved = localStorage.getItem('cb_clients')
    if (saved) setClients(JSON.parse(saved))
  }, [])

  function save(list: Client[]) { setClients(list); localStorage.setItem('cb_clients', JSON.stringify(list)) }

  function addClient() {
    if (!form.name?.trim()) return
    const c: Client = { id: Date.now().toString(), name: form.name.trim(), email: form.email || '', phone: form.phone || '', company: form.company || '', status: (form.status as Client['status']) || 'lead', value: Number(form.value) || 0, notes: form.notes || '', starred: false, added: new Date().toISOString(), tags: [] }
    save([c, ...clients])
    setAdding(false)
    setForm({})
  }

  function updateClient() {
    if (!selected) return
    const updated = { ...selected, ...form }
    save(clients.map(c => c.id === selected.id ? updated : c))
    setSelected(updated)
    setEditing(false)
  }

  function deleteClient(id: string) {
    save(clients.filter(c => c.id !== id))
    setSelected(null)
  }

  function toggleStar(id: string) {
    save(clients.map(c => c.id === id ? { ...c, starred: !c.starred } : c))
    if (selected?.id === id) setSelected({ ...selected, starred: !selected.starred })
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const match = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
    const f = filter === 'all' ? true : filter === 'starred' ? c.starred : c.status === filter
    return match && f
  })

  const totalValue = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.value, 0)

  function FormField({ label, field, type = 'text' }: { label: string; field: keyof Client; type?: string }) {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</label>
        <input type={type} value={(form[field] as string) || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
      </div>
    )
  }

  if (selected && !adding) {
    const c = selected
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '1.5rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <button onClick={() => { setSelected(null); setEditing(false) }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>← Back</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleStar(c.id)} style={{ background: '#1e293b', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: c.starred ? '#f59e0b' : '#475569' }}><Star size={16} fill={c.starred ? '#f59e0b' : 'none'} /></button>
              <button onClick={() => { setEditing(!editing); setForm({ ...c }) }} style={{ background: editing ? ACCENT : '#1e293b', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: editing ? '#fff' : '#94a3b8' }}><Edit2 size={16} /></button>
              <button onClick={() => deleteClient(c.id)} style={{ background: '#1e293b', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
            </div>
          </div>

          {editing ? (
            <div style={{ background: '#1e293b', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Client</h3>
              <FormField label="Name *" field="name" />
              <FormField label="Email" field="email" type="email" />
              <FormField label="Phone" field="phone" />
              <FormField label="Company" field="company" />
              <FormField label="Contract Value ($)" field="value" type="number" />
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>Status</label>
                <select value={form.status || 'lead'} onChange={e => setForm({ ...form, status: e.target.value as Client['status'] })} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 14 }}>
                  <option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 13, resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={updateClient} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Save size={14} /> Save</button>
                <button onClick={() => setEditing(false)} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#888', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: '#1e293b', borderRadius: 16, padding: '1.5rem', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>{c.name}</h2>
                    {c.company && <p style={{ color: '#94a3b8', fontSize: 14 }}>{c.company}</p>}
                  </div>
                  <span style={{ background: STATUS_COLORS[c.status] + '22', color: STATUS_COLORS[c.status], borderRadius: 20, padding: '0.3rem 0.8rem', fontSize: 12, fontWeight: 600 }}>{c.status}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><Mail size={15} style={{ color: ACCENT }} /><a href={'mailto:' + c.email} style={{ color: '#94a3b8', textDecoration: 'none' }}>{c.email}</a></div>}
                  {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><Phone size={15} style={{ color: ACCENT }} />{c.phone}</div>}
                  {c.value > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={15} style={{ color: ACCENT }} /><span style={{ color: '#fff', fontWeight: 600 }}>${c.value.toLocaleString()}</span></div>}
                </div>
              </div>
              {c.notes && <div style={{ background: '#1e293b', borderRadius: 16, padding: '1.5rem' }}><h3 style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Notes</h3><p style={{ color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.notes}</p></div>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} style={{ color: ACCENT }} />
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>ClientBook</h1>
          </div>
          <button onClick={() => { setAdding(true); setForm({ status: 'lead' }) }} style={{ background: ACCENT, border: 'none', borderRadius: 12, padding: '0.6rem 1.2rem', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Add Client</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, background: '#1e293b', borderRadius: 16, padding: '1rem' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: ACCENT, fontSize: 20, fontWeight: 800 }}>{clients.length}</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Total</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: '#22c55e', fontSize: 20, fontWeight: 800 }}>{clients.filter(c => c.status === 'active').length}</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Active</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>${totalValue.toLocaleString()}</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Total Value</p>
          </div>
        </div>

        {adding && (
          <div style={{ background: '#1e293b', borderRadius: 16, padding: '1.5rem', marginBottom: 16, border: '1px solid #334155' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Client</h3>
            <FormField label="Name *" field="name" />
            <FormField label="Email" field="email" type="email" />
            <FormField label="Phone" field="phone" />
            <FormField label="Company" field="company" />
            <FormField label="Contract Value ($)" field="value" type="number" />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['lead', 'active', 'inactive'] as const).map(s => <button key={s} onClick={() => setForm({ ...form, status: s })} style={{ flex: 1, background: form.status === s ? STATUS_COLORS[s] : '#0f172a', border: 'none', borderRadius: 8, padding: '0.5rem', color: form.status === s ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addClient} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button>
              <button onClick={() => { setAdding(false); setForm({}) }} style={{ background: '#334155', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#888', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '0.7rem 0.7rem 0.7rem 36px', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['all', 'active', 'lead', 'starred'] as const).map(f => <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? ACCENT : '#1e293b', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', color: filter === f ? '#000' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>)}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#334155' }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>{clients.length === 0 ? 'No clients yet' : 'No clients found'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(c => (
              <div key={c.id} onClick={() => { setSelected(c); setForm({ ...c }) }} style={{ background: '#1e293b', borderRadius: 12, padding: '1rem 1.2rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: ACCENT + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontWeight: 700, fontSize: 15 }}>{c.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</p>
                      {c.starred && <Star size={12} style={{ color: '#f59e0b' }} fill="#f59e0b" />}
                    </div>
                    <p style={{ color: '#64748b', fontSize: 12 }}>{c.company || c.email || 'No details'}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: STATUS_COLORS[c.status] + '22', color: STATUS_COLORS[c.status], borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>{c.status}</span>
                  {c.value > 0 && <span style={{ color: '#64748b', fontSize: 12 }}>${c.value.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  }
