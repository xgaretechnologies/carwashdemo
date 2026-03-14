import { useState, useEffect, useRef } from 'react'
import s from './LoginModal.module.css'

export default function LoginModal({ onClose, onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => ref.current?.focus(), 150)
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleEscape)
    }

  }, [onClose, loading])

  async function submit() {
    if (!user.trim() || !pass) {
      setErr('Please enter username and password.')
      return
    }

    setLoading(true)
    setErr('')

    try {
      await onLogin(user.trim(), pass)
    } catch (e) {
      setErr(e.message || 'Invalid credentials. Please try again.')
      setPass('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={s.overlay}
      onClick={e => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div className={s.box}>
        <div className={s.top}>
          <div className={s.shield}>🔐</div>
          <div className={s.logo}>Vernon Auto<span>Detailing</span></div>
          <div className={s.tag}>Staff Portal — Authorised Personnel Only</div>
        </div>

        <div className={s.body}>
          <h2>Welcome Back</h2>
          <p>Sign in to access the dashboard and manage bookings.</p>

          {err && <div className={s.error}>{err}</div>}

          <div className={s.field}>
            <label>Username</label>
            <input
              ref={ref}
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="e.g. staff01"
              onKeyDown={e => e.key === 'Enter' && submit()}
              disabled={loading}
            />
          </div>

          <div className={s.field}>
            <label>Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && submit()}
              disabled={loading}
            />
          </div>

          <button className={s.btn} onClick={submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <div className={s.hint}>
            <strong>Manager:</strong> manager / shine123
          </div>
        </div>
      </div>
    </div>
  )
}