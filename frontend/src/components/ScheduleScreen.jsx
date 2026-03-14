import { useState, useMemo } from 'react'
import { ALL_TIME_SLOTS, BLOCKED_SLOTS, STATUS_META, todayStr, fmtDate, fmtDateFull, dateToIso } from '../data.js'
import BookingModal from './BookingModal.jsx'
import s from './ScheduleScreen.module.css'

function dateRange() {
  const days = []
  for (let i = -2; i <= 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    days.push(dateToIso(d))
  }
  return days
}

function chipLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate() }
}

const PERIOD_SLOTS = {
  '🌅 Morning': ALL_TIME_SLOTS.filter(t => t.includes('AM')),
  '☀️ Afternoon': ALL_TIME_SLOTS.filter(t => t.includes('PM') && (parseInt(t) < 5 || t.startsWith('12'))),
  '🌆 Evening': ALL_TIME_SLOTS.filter(t => t.includes('PM') && parseInt(t) >= 5 && !t.startsWith('12')),
}

export default function ScheduleScreen({ bookings, session, createBooking, patchBookingStatus, onRefresh }) {
  const [selDate, setSelDate] = useState(todayStr())
  const [preSlot, setPreSlot] = useState('')
  const [preType, setPreType] = useState('walkin')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailBk, setDetailBk] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toastErr, setToastErr] = useState('')

  const dates = dateRange()
  const dayBk = useMemo(() => bookings.filter(b => b.date === selDate && b.status !== 'cancelled'), [bookings, selDate])

  const totalSlots = ALL_TIME_SLOTS.filter(t => !BLOCKED_SLOTS.includes(t)).length * 2
  const bkCount = dayBk.length
  const avail = totalSlots - bkCount
  const inprogress = dayBk.filter(b => b.status === 'inprogress').length
  const done = dayBk.filter(b => b.status === 'done').length

  function showErr(msg) { setToastErr(msg); setTimeout(() => setToastErr(''), 4000) }
  function flash(id) { setFlashId(id); setTimeout(() => setFlashId(null), 2500) }

  function openBook(slot, type = 'walkin') { setPreSlot(slot); setPreType(type); setModalOpen(true) }

  async function handleSave(data) {
    const nb = await createBooking(data)
    setModalOpen(false)
    flash(nb.id)
  }

  async function handleStatusChange(id, status) {
    setBusy(true)
    try {
      const updated = await patchBookingStatus(id, status)
      setDetailBk(prev => prev?.id === id ? updated : prev)
    } catch (err) {
      showErr(err.message || 'Failed to update status')
    } finally {
      setBusy(false)
    }
  }

  // Keep detailBk in sync when bookings refresh
  const syncedDetail = detailBk ? (bookings.find(b => b.id === detailBk.id) || null) : null

  const STATUS_TRANSITIONS = {
    pending: [['inprogress', '▶ Start'], ['cancelled', '✕ Cancel']],
    inprogress: [['done', '✓ Complete'], ['pending', '◀ Revert']],
    done: [['pending', '↩ Reopen']],
    cancelled: [['pending', '↩ Restore']],
  }

  return (
    <div className={s.wrap}>
      {toastErr && <div className={s.toast}>⚠️ {toastErr}</div>}

      {/* Header */}
      <div className={s.pageHdr}>
        <div>
          <h1 className={s.pageTitle}>🗓️ Schedule</h1>
          <p className={s.pageSub}>{fmtDateFull(selDate)} — Slot availability &amp; status at a glance</p>
        </div>
        <button className={s.btnRefresh} onClick={onRefresh} title="Refresh">↻</button>
      </div>

      {/* Date strip */}
      <div className={s.dateStrip}>
        {dates.map(iso => {
          const { day, num } = chipLabel(iso)
          const isToday = iso === todayStr()
          const cnt = bookings.filter(b => b.date === iso && b.status !== 'cancelled').length
          return (
            <button key={iso} className={`${s.dateChip} ${selDate === iso ? s.dateSel : ''} ${isToday ? s.dateToday : ''}`} onClick={() => { setSelDate(iso); setDetailBk(null) }}>
              <span className={s.dcDay}>{isToday ? 'Today' : day}</span>
              <span className={s.dcNum}>{num}</span>
              {cnt > 0 && <span className={s.dcCount}>{cnt}</span>}
            </button>
          )
        })}
      </div>

      {/* Day summary */}
      <div className={s.daySummary}>
        {[['Available', avail, 'var(--green)'], ['Booked', dayBk.length, 'var(--orange)'], ['In Progress', inprogress, 'var(--cyan)'], ['Done', done, 'var(--muted)']].map(([l, v, c]) => (
          <div key={l} className={s.sumItem}>
            <span style={{ color: c }} className={s.sumNum}>{v}</span>
            <span className={s.sumLbl}>{l}</span>
          </div>
        ))}
        <div className={s.sumLegend}>
          {[['var(--green)', 'Free'], ['var(--orange)', 'Pending'], ['var(--cyan)', 'In Progress'], ['var(--green)', 'Done'], ['rgba(255,77,106,.5)', 'Blocked']].map(([c, l]) => (
            <span key={l} className={s.legItem}><span className={s.legDot} style={{ background: c }} />{l}</span>
          ))}
        </div>
      </div>

      {/* Grid + Detail */}
      <div className={s.content}>
        <div className={s.grid}>
          {Object.entries(PERIOD_SLOTS).map(([period, slots]) => (
            <div key={period} className={s.periodSection}>
              <div className={s.periodTitle}>{period}</div>
              <div className={s.slotRow}>
                {slots.map(t => {
                  const blocked = BLOCKED_SLOTS.includes(t)
                  return (
                    <div key={t} className={s.slotGroup}>
                      <div className={s.slotTimeHeader}>{t}</div>
                      <div className={s.slotSubGrid}>
                        {['walkin', 'pickup'].map(type => {
                          const bk = dayBk.find(b => {
                            const bType = (b.type || 'walkin').toLowerCase().trim().replace(/-/g, '')
                            const tType = type.toLowerCase().trim().replace(/-/g, '')
                            return b.slot === t && bType === tType
                          })
                          const meta = bk ? STATUS_META[bk.status] : null
                          const isFlash = bk?.id === flashId
                          const isDetail = syncedDetail?.id === bk?.id

                          if (blocked) return (
                            <div key={type} className={`${s.miniSlot} ${s.miniSlotBlocked}`}>
                              <span className={s.miniSlotIcon}>{type === 'pickup' ? '🚐' : '🏠'}</span>
                            </div>
                          )

                          if (!bk) return (
                            <div key={type} className={`${s.miniSlot} ${s.miniSlotFree}`} onClick={() => openBook(t, type)}>
                              <span className={s.miniSlotIcon}>{type === 'pickup' ? '🚐' : '🏠'}</span>
                              <span className={s.miniSlotAdd}>+</span>
                            </div>
                          )

                          return (
                            <div key={type}
                              className={`${s.miniSlot} ${s.miniSlotBooked} ${isFlash ? s.slotFlash : ''} ${isDetail ? s.slotActive : ''}`}
                              style={{ borderColor: meta.color + '66', background: meta.color + '12', color: meta.color }}
                              onClick={() => setDetailBk(isDetail ? null : bk)}
                            >
                              <span className={s.miniSlotIcon}>{type === 'pickup' ? '🚐' : '🏠'}</span>
                              <span className={s.miniSlotName}>{bk.customer.split(' ')[0]}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {syncedDetail && (
          <div className={s.detail}>
            <div className={s.detailHdr}>
              <div className={s.detailTitle}>Booking Detail</div>
              <button className={s.detailClose} onClick={() => setDetailBk(null)}>✕</button>
            </div>
            <div className={s.detailBody}>
              <div className={s.detailSlot}>{syncedDetail.slot}</div>

              <div className={s.detailSection}>Customer</div>
              <DRow label="Name" val={syncedDetail.customer} />
              <DRow label="Phone" val={syncedDetail.phone} />
              {syncedDetail.email && <DRow label="Email" val={syncedDetail.email} />}

              <div className={s.detailSection}>Vehicle</div>
              <DRow label="Car" val={`${syncedDetail.year} ${syncedDetail.make} ${syncedDetail.model}`} />
              <DRow label="Plate" val={syncedDetail.plate} />
              <DRow label="Size" val={syncedDetail.size} />
              <DRow label="Condition" val={syncedDetail.cond} />

              <div className={s.detailSection}>Service</div>
              <DRow label="Service" val={syncedDetail.service} />
              <DRow label="Type" val={(syncedDetail.type || 'walkin').toLowerCase().trim().replace(/-/g, '') === 'pickup' ? '🚐 Pickup' : '🏠 Walk-in'} />
              {syncedDetail.notes && <DRow label="Notes" val={syncedDetail.notes} />}

              <div className={s.detailSection}>Status</div>
              <div className={s.statusBadgeLg} style={{
                color: STATUS_META[syncedDetail.status].color,
                borderColor: STATUS_META[syncedDetail.status].color + '55',
                background: STATUS_META[syncedDetail.status].color + '15',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_META[syncedDetail.status].color, display: 'inline-block' }} />
                {STATUS_META[syncedDetail.status].label}
              </div>

              <div className={s.detailActions}>
                {(STATUS_TRANSITIONS[syncedDetail.status] || []).map(([to, label]) => (
                  <button key={to} disabled={busy} className={s.actBtn}
                    style={to === 'done' ? { background: 'var(--green)', color: 'var(--black)', border: 'none' } : to === 'cancelled' ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}
                    onClick={() => handleStatusChange(syncedDetail.id, to)}
                  >
                    {busy ? '…' : label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <BookingModal
          mode="create"
          preSlot={preSlot}
          preType={preType}
          bookings={bookings}
          initial={{ date: selDate }}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function DRow({ label, val }) {
  return (
    <div className={s.detailRow}>
      <span>{label}</span><strong>{val}</strong>
    </div>
  )
}
