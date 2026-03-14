import { useState, useEffect } from 'react'
import { ALL_TIME_SLOTS, BLOCKED_SLOTS, SERVICES_LIST, VEHICLE_SIZES, CONDITIONS, todayStr, fmtDate } from '../data.js'
import s from './BookingModal.module.css'

function dateRange() {
  const days = []
  for (let i = 0; i <= 14; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function BookingModal({ mode = 'create', initial = null, bookings = [], bookedSlots = [], preSlot = '', preType = 'walkin', onClose, onSave }) {
  const blank = { customer: '', phone: '', email: '', make: '', model: '', year: '', plate: '', size: '', cond: '', service: '', type: preType, slot: preSlot, date: todayStr(), notes: '' }
  const [f, setF] = useState({ ...blank, ...initial })
  const [errs, setErrs] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiErr, setApiErr] = useState('')

  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: false })); setApiErr('') }

  function validate() {
    const e = {}
    if (!f.customer.trim()) e.customer = true
    if (f.phone.replace(/\D/g, '').length < 7) e.phone = true
    if (!f.make.trim()) e.make = true
    if (!f.model.trim()) e.model = true
    const y = parseInt(f.year); if (!(y >= 1990 && y <= 2026)) e.year = true
    if (!f.size) e.size = true
    if (!f.cond) e.cond = true
    if (!f.service) e.service = true
    if (!f.slot) e.slot = true
    setErrs(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true); setApiErr('')
    try {
      await onSave({ ...f, id: initial?.id, status: initial?.status || 'pending' })
    } catch (err) {
      setApiErr(err.message || 'Failed to save booking. Please try again.')
    } finally {
      setSaving(false)
    }
  }



  const dates = dateRange()

  const PERIODS = [
    { label: '🌅 Morning', slots: ALL_TIME_SLOTS.filter(t => t.includes('AM') && parseInt(t) < 12) },
    { label: '☀️ Afternoon', slots: ALL_TIME_SLOTS.filter(t => (t.includes('PM') && parseInt(t) < 5) || t.startsWith('12:')) },
    { label: '🌆 Evening', slots: ALL_TIME_SLOTS.filter(t => t.includes('PM') && parseInt(t) >= 5 && !t.startsWith('12:')) },
  ]

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.box}>
        <div className={s.hdr}>
          <div>
            <div className={s.title}>{mode === 'edit' ? '✏️ Edit Booking' : '➕ New Booking'}</div>
            <div className={s.sub}>Fill in customer &amp; vehicle details, then pick a time slot</div>
          </div>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          {apiErr && <div className={s.apiErr}>⚠️ {apiErr}</div>}

          <Divider>Customer Info</Divider>
          <div className={s.row}>
            <F label="Full Name" err={errs.customer} msg="Required.">
              <input value={f.customer} onChange={e => set('customer', e.target.value)} placeholder="e.g. Alex Johnson" className={errs.customer ? s.inputErr : ''} />
            </F>
            <F label="Phone" err={errs.phone} msg="Min 7 digits.">
              <input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" className={errs.phone ? s.inputErr : ''} />
            </F>
          </div>
          <F label="Email (optional)">
            <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="customer@example.com" />
          </F>

          <Divider>Vehicle Info</Divider>
          <div className={s.row}>
            <F label="Make" err={errs.make} msg="Required.">
              <input value={f.make} onChange={e => set('make', e.target.value)} placeholder="e.g. Toyota" className={errs.make ? s.inputErr : ''} />
            </F>
            <F label="Model" err={errs.model} msg="Required.">
              <input value={f.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Camry" className={errs.model ? s.inputErr : ''} />
            </F>
          </div>
          <div className={s.row}>
            <F label="Year" err={errs.year} msg="1990–2026.">
              <input type="number" value={f.year} onChange={e => set('year', e.target.value)} placeholder="2022" min="1990" max="2026" className={errs.year ? s.inputErr : ''} />
            </F>
            <F label="Plate / Colour">
              <input value={f.plate} onChange={e => set('plate', e.target.value)} placeholder="KA01 AB 1234 / Black" />
            </F>
          </div>
          <F label="Vehicle Size" err={errs.size} msg="Required.">
            <select value={f.size} onChange={e => set('size', e.target.value)} className={errs.size ? s.inputErr : ''}>
              <option value="">— Select size —</option>
              {VEHICLE_SIZES.map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F label="Select Service" err={errs.service} msg="Required.">
            <select value={f.service} onChange={e => set('service', e.target.value)} className={errs.service ? s.inputErr : ''}>
              <option value="">— Choose a service —</option>
              {SERVICES_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="Condition" err={errs.cond} msg="Select condition.">
            <div className={s.chips}>
              {CONDITIONS.map(c => (
                <div key={c} className={`${s.chip} ${f.cond === c ? s.chipSel : ''}`} onClick={() => set('cond', c)}>{c}</div>
              ))}
            </div>
          </F>

          <Divider>Date &amp; Time Slot</Divider>
          <F label="Select Date">
            <div className={s.dateStrip}>
              {dates.map(iso => {
                const d = new Date(iso + 'T00:00:00')
                const day = d.toLocaleDateString('en-IN', { weekday: 'short' })
                const num = d.getDate()
                const isToday = iso === todayStr()
                return (
                  <div key={iso}
                    className={`${s.dateChip} ${f.date === iso ? s.dateChipSel : ''}`}
                    onClick={() => { set('date', iso); set('slot', '') }}
                  >
                    <div className={s.dcDay}>{isToday ? 'Today' : day}</div>
                    <div className={s.dcNum}>{num}</div>
                  </div>
                )
              })}
            </div>
          </F>

          <Divider>Booking Type</Divider>
          <div className={s.chips} style={{ marginBottom: '20px' }}>
            {[
              { id: 'walkin', label: '🏠 Walk-in', icon: '🏠' },
              { id: 'pickup', label: '🚐 Pickup', icon: '🚐' }
            ].map(t => (
              <div
                key={t.id}
                className={`${s.chip} ${f.type === t.id ? s.chipSel : ''}`}
                onClick={() => { set('type', t.id); set('slot', '') }}
                style={{ flex: 1, padding: '12px', textAlign: 'center', fontSize: '.85rem' }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.icon}</div>
                {t.label}
              </div>
            ))}
          </div>

          <F label={`${f.type === 'pickup' ? '🚐 Pickup' : '🏠 Walk-in'} Slot — ${fmtDate(f.date)}`} err={errs.slot} msg="Select a slot.">
            {PERIODS.map(p => (
              <div key={p.label} className={s.period}>
                <div className={s.periodLbl}>{p.label}</div>
                <div className={s.slotGrid}>
                  {p.slots.map(t => {
                    const blocked = BLOCKED_SLOTS.includes(t)
                    const booked = !blocked && (
                      bookings.length > 0
                        ? bookings.some(b => {
                          if (b.status === 'cancelled') return false
                          if (b.date !== f.date || b.slot !== t) return false
                          const bType = (b.type || 'walkin').toLowerCase().trim().replace(/-/g, '')
                          const fType = (f.type || 'walkin').toLowerCase().trim().replace(/-/g, '')
                          return bType === fType && b.id !== initial?.id
                        })
                        : (bookedSlots || []).some(s => s === t)
                    )
                    const isSel = f.slot === t
                    const disabled = blocked || booked
                    return (
                      <div key={t}
                        className={`${s.slot} ${blocked ? s.slotBlocked : booked ? s.slotBooked : ''} ${isSel ? s.slotSel : ''}`}
                        onClick={() => !disabled && set('slot', t)}
                      >
                        {t}
                        <div className={s.slotSub}>
                          {blocked ? 'Blocked' : booked ? 'Booked' : f.type === 'pickup' ? 'Pickup' : 'Walk-in'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </F>

          <F label="Notes (optional)">
            <textarea value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Scratches, stains, special requests…" />
          </F>

          <div className={s.footer}>
            <button className={s.btnCancel} onClick={onClose} disabled={saving}>Cancel</button>
            <button className={s.btnSave} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : mode === 'edit' ? '✓ Save Changes' : '✓ Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Divider({ children }) {
  return (
    <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '8px', margin: '18px 0 12px' }}>
      {children}<span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
    </div>
  )
}

function F({ label, children, err, msg }) {
  return (
    <div style={{ marginBottom: '13px', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>
      {children}
      {err && msg && <div style={{ fontSize: '.73rem', color: 'var(--red)', marginTop: '4px' }}>{msg}</div>}
    </div>
  )
}
