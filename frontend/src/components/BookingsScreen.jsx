import { useState, useMemo } from 'react'
import { STATUS_META, NEXT_STATUSES, ALL_TIME_SLOTS, todayStr, fmtDate, fmtDateFull, dateToIso } from '../data.js'
import BookingModal from './BookingModal.jsx'
import s from './BookingsScreen.module.css'

const FILTERS = ['all', 'pending', 'inprogress', 'done', 'cancelled']

function dateRange() {
  const days = []
  for (let i = -3; i <= 6; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    days.push(dateToIso(d))
  }
  return days
}

function chipLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate() }
}

export default function BookingsScreen({ bookings, session, createBooking, updateBooking, patchBookingStatus, onRefresh }) {
  const [selDate, setSelDate] = useState(todayStr())
  const [filter, setFilter] = useState('all')
  const [editBk, setEditBk] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [flashId, setFlashId] = useState(null)
  const [busy, setBusy] = useState({})  // id → true while patching
  const [toastErr, setToastErr] = useState('')

  const dates = dateRange()

  const dayBk = useMemo(() => bookings.filter(b => b.date === selDate), [bookings, selDate])

  const shown = useMemo(() => {
    const list = filter === 'all' ? dayBk : dayBk.filter(b => b.status === filter)
    return [...list].sort((a, b) => ALL_TIME_SLOTS.indexOf(a.slot) - ALL_TIME_SLOTS.indexOf(b.slot))
  }, [dayBk, filter])

  const stats = useMemo(() => ({
    total: dayBk.length,
    pending: dayBk.filter(b => b.status === 'pending').length,
    inprogress: dayBk.filter(b => b.status === 'inprogress').length,
    done: dayBk.filter(b => b.status === 'done').length,
  }), [dayBk])

  function flash(id) { setFlashId(id); setTimeout(() => setFlashId(null), 2500) }
  function showErr(msg) { setToastErr(msg); setTimeout(() => setToastErr(''), 4000) }

  async function handleStatusChange(id, status) {
    setBusy(p => ({ ...p, [id]: true }))
    try {
      await patchBookingStatus(id, status)
    } catch (err) {
      showErr(err.message || 'Failed to update status')
    } finally {
      setBusy(p => ({ ...p, [id]: false }))
    }
  }

  async function handleSave(data) {
    if (editBk) {
      await updateBooking(editBk.id, data)
      flash(editBk.id)
    } else {
      const nb = await createBooking(data)
      flash(nb.id)
    }
    setEditBk(null); setCreateOpen(false)
  }


  return (
    <div className={s.wrap}>
      {/* Error toast */}
      {toastErr && (
        <div className={s.toast}>⚠️ {toastErr}</div>
      )}

      {/* Page header */}
      <div className={s.pageHdr}>
        <div>
          <h1 className={s.pageTitle}>📋 Bookings</h1>
          <p className={s.pageSub}>{fmtDateFull(selDate)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={s.btnRefresh} onClick={onRefresh} title="Refresh">↻</button>
          <button className={s.btnNew} onClick={() => setCreateOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Booking
          </button>
        </div>
      </div>

      {/* Date strip */}
      <div className={s.dateStrip}>
        {dates.map(iso => {
          const { day, num } = chipLabel(iso)
          const isToday = iso === todayStr()
          const hasBk = bookings.some(b => b.date === iso)
          return (
            <button key={iso} className={`${s.dateChip} ${selDate === iso ? s.dateSel : ''} ${isToday ? s.dateToday : ''}`} onClick={() => setSelDate(iso)}>
              <span className={s.dcDay}>{isToday ? 'Today' : day}</span>
              <span className={s.dcNum}>{num}</span>
              {hasBk && <span className={s.dcDot} />}
            </button>
          )
        })}
      </div>

      {/* Summary cards */}
      <div className={s.cards}>
        {[['Total', stats.total, 'var(--cyan)'], ['Pending', stats.pending, 'var(--orange)'], ['In Progress', stats.inprogress, 'var(--cyan)'], ['Done', stats.done, 'var(--green)']].map(([l, v, c]) => (
          <div key={l} className={s.card}>
            <div className={s.cardLbl}>{l}</div>
            <div className={s.cardNum} style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className={s.filterRow}>
        {FILTERS.map(f => (
          <button key={f} className={`${s.ftab} ${filter === f ? s.ftabSel : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'inprogress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={s.ftabCount}>{f === 'all' ? dayBk.length : dayBk.filter(b => b.status === f).length}</span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className={s.list}>
        {shown.length === 0 ? (
          <div className={s.empty}>
            <div>📭</div>
            <p>No {filter !== 'all' ? filter : ''} bookings for {selDate === todayStr() ? 'today' : fmtDate(selDate)}.</p>
          </div>
        ) : shown.map(bk => {
          const meta = STATUS_META[bk.status]
          const isBusy = busy[bk.id]
          return (
            <div key={bk.id} className={`${s.row} ${bk.id === flashId ? s.rowFlash : ''}`}>
              <div className={s.colTime}>
                <div className={s.timeMain}>{bk.slot.replace(' AM', '').replace(' PM', '')}</div>
                <div className={s.timePer}>{bk.slot.includes('AM') ? 'AM' : 'PM'}</div>
              </div>
              <div className={s.colCust}>
                <strong>{bk.customer}</strong>
                <span>{(bk.type || 'walkin').toLowerCase().trim().replace(/-/g, '') === 'pickup' ? '🚐 Pickup' : '🏠 Walk-in'} · {bk.phone}</span>
              </div>
              <div className={s.colVeh}>
                <strong>{bk.year} {bk.make} {bk.model}</strong>
                <span>{bk.plate} · {bk.cond}</span>
              </div>
              <div className={s.colSvc}>
                <span className={s.svcBadge}>{bk.service}</span>
              </div>
              <div className={s.colStatus}>
                <span className={s.statusBadge} style={{ color: meta.color, borderColor: meta.color + '55', background: meta.color + '15' }}>
                  <span className={s.statusDot} style={{ background: meta.color }} />
                  {meta.label}
                </span>
                <div className={s.actions}>
                  {(NEXT_STATUSES[bk.status] || []).map(([v, l]) => (
                    <button key={v} className={s.actBtn} disabled={isBusy} onClick={() => handleStatusChange(bk.id, v)}>
                      {isBusy ? '…' : l}
                    </button>
                  ))}
                  <button className={s.editBtn} onClick={() => setEditBk(bk)}>✏️</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {(createOpen || editBk) && (
        <BookingModal
          mode={editBk ? 'edit' : 'create'}
          initial={editBk || { date: selDate }}
          bookings={bookings}
          onClose={() => { setEditBk(null); setCreateOpen(false) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
