import { useState, useEffect } from 'react'
import { ROLES, SHIFTS } from '../data.js'
import s from './EmployeesScreen.module.css'

const BLANK = { name: '', role: '', phone: '', email: '', shift: '', status: 'active' }

export default function EmployeesScreen({ employees, createEmployee, updateEmployee, patchEmployeeStatus, deleteEmployee }) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toastErr, setToastErr] = useState('')

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  )

  const active = employees.filter(e => e.status === 'active').length
  const inactive = employees.filter(e => e.status === 'inactive').length

  function showErr(msg) { setToastErr(msg); setTimeout(() => setToastErr(''), 4000) }
  function flash(id) { setFlashId(id); setTimeout(() => setFlashId(null), 2200) }

  async function handleSave(form) {
    try {
      if (form.id) {
        await updateEmployee(form.id, form)
        flash(form.id)
      } else {
        const ne = await createEmployee(form)
        flash(ne.id)
      }
      setModal(null)
    } catch (err) {
      throw err  // re-throw so EmpModal can show it
    }
  }

  async function handleToggleStatus(emp) {
    const next = emp.status === 'active' ? 'inactive' : 'active'
    try {
      await patchEmployeeStatus(emp.id, next)
      flash(emp.id)
    } catch (err) {
      showErr(err.message || 'Failed to update status')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteEmployee(id)
      setConfirm(null)
    } catch (err) {
      showErr(err.message || 'Failed to delete employee')
      setConfirm(null)
    }
  }

  return (
    <div className={s.wrap}>
      {toastErr && <div className={s.toast}>⚠️ {toastErr}</div>}

      {/* Header */}
      <div className={s.pageHdr}>
        <div>
          <h1 className={s.pageTitle}>👥 Employees</h1>
          <p className={s.pageSub}>Manage your team — create, edit, and track staff members</p>
        </div>
        <button className={s.btnAdd} onClick={() => setModal({ ...BLANK })}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className={s.stats}>
        <div className={s.statCard}><div className={s.statN} style={{ color: 'var(--cyan)' }}>{employees.length}</div><div className={s.statL}>Total Staff</div></div>
        <div className={s.statCard}><div className={s.statN} style={{ color: 'var(--green)' }}>{active}</div><div className={s.statL}>Active</div></div>
        <div className={s.statCard}><div className={s.statN} style={{ color: 'var(--muted)' }}>{inactive}</div><div className={s.statL}>Inactive</div></div>
      </div>

      {/* Search */}
      <div className={s.searchRow}>
        <div className={s.searchWrap}>
          <svg className={s.searchIco} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className={s.searchInput} placeholder="Search by name or role…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      <div className={s.list}>
        {filtered.length === 0 ? (
          <div className={s.empty}><div>🔍</div><p>No employees match your search.</p></div>
        ) : filtered.map(emp => (
          <div key={emp.id} className={`${s.empRow} ${emp.id === flashId ? s.rowFlash : ''} ${emp.status === 'inactive' ? s.rowInactive : ''}`}>
            <div className={s.avatar} style={{ background: emp.status === 'inactive' ? 'var(--panel)' : 'linear-gradient(135deg,var(--cyan),var(--blue))' }}>
              {emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className={s.empInfo}>
              <div className={s.empName}>{emp.name}</div>
              <div className={s.empMeta}>
                <span className={s.rolePill}>{emp.role}</span>
                <span className={s.shiftPill}>⏰ {emp.shift}</span>
              </div>
            </div>
            <div className={s.empContact}>
              <div>📞 {emp.phone}</div>
              {emp.email && <div>✉️ {emp.email}</div>}
            </div>
            <div className={s.empStatus}>
              <span className={`${s.statusBadge} ${emp.status === 'active' ? s.statusActive : s.statusInactive}`}>
                <span className={s.statusDot} />{emp.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className={s.empActions}>
              <button className={s.actBtn} onClick={() => setModal({ ...emp })}>✏️ Edit</button>
              <button className={`${s.actBtn} ${emp.status === 'active' ? s.actDeact : s.actAct}`} onClick={() => handleToggleStatus(emp)}>
                {emp.status === 'active' ? '⏸ Deactivate' : '▶ Activate'}
              </button>
              <button className={`${s.actBtn} ${s.actDel}`} onClick={() => setConfirm(emp.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <EmpModal emp={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {confirm && (
        <div className={s.confirmOverlay} onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className={s.confirmBox}>
            <div className={s.confirmIcon}>⚠️</div>
            <h3>Delete Employee?</h3>
            <p>This action cannot be undone. The employee record will be permanently removed.</p>
            <div className={s.confirmBtns}>
              <button className={s.confirmCancel} onClick={() => setConfirm(null)}>Cancel</button>
              <button className={s.confirmDel} onClick={() => handleDelete(confirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmpModal({ emp, onClose, onSave }) {
  const [f, setF] = useState({ ...emp })
  const [errs, setErrs] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiErr, setApiErr] = useState('')

  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: false })); setApiErr('') }

  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  function validate() {
    const e = {}
    if (!f.name.trim()) e.name = true
    if (!f.role) e.role = true
    if (!f.shift) e.shift = true
    if (f.phone.replace(/\D/g, '').length < 7) e.phone = true
    setErrs(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true); setApiErr('')
    try {
      await onSave(f)
    } catch (err) {
      setApiErr(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modalBox}>
        <div className={s.modalHdr}>
          <div className={s.modalTitle}>{f.id ? '✏️ Edit Employee' : '➕ Add Employee'}</div>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>
          {apiErr && <div style={{ background: 'rgba(255,77,106,.1)', border: '1px solid rgba(255,77,106,.3)', borderRadius: 8, padding: '10px 14px', fontSize: '.82rem', color: 'var(--red)', marginBottom: 14 }}>⚠️ {apiErr}</div>}
          <MF label="Full Name" err={errs.name} msg="Required.">
            <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ravi Kumar" className={errs.name ? s.inputErr : ''} />
          </MF>
          <div className={s.mRow}>
            <MF label="Role" err={errs.role} msg="Required.">
              <select value={f.role} onChange={e => set('role', e.target.value)} className={errs.role ? s.inputErr : ''}>
                <option value="">— Select role —</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </MF>
            <MF label="Shift" err={errs.shift} msg="Required.">
              <select value={f.shift} onChange={e => set('shift', e.target.value)} className={errs.shift ? s.inputErr : ''}>
                <option value="">— Select shift —</option>
                {SHIFTS.map(r => <option key={r}>{r}</option>)}
              </select>
            </MF>
          </div>
          <div className={s.mRow}>
            <MF label="Phone" err={errs.phone} msg="Min 7 digits.">
              <input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="9001234567" className={errs.phone ? s.inputErr : ''} />
            </MF>
            <MF label="Email (optional)">
              <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="emp@VernonAutoDetailing.com" />
            </MF>
          </div>
          <MF label="Status">
            <div className={s.statusToggleGroup}>
              {['active', 'inactive'].map(v => (
                <button key={v} className={`${s.stBtn} ${f.status === v ? s.stBtnSel : ''}`} onClick={() => set('status', v)}>
                  {v === 'active' ? '✅ Active' : '⏸ Inactive'}
                </button>
              ))}
            </div>
          </MF>
          <div className={s.modalFooter}>
            <button className={s.btnCancel} onClick={onClose} disabled={saving}>Cancel</button>
            <button className={s.btnSave} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : f.id ? '✓ Save Changes' : '✓ Add Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MF({ label, children, err, msg }) {
  return (
    <div style={{ marginBottom: '13px', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>
      {children}
      {err && msg && <div style={{ fontSize: '.73rem', color: 'var(--red)', marginTop: '4px' }}>{msg}</div>}
    </div>
  )
}
