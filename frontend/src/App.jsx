import { useState, useEffect, useCallback } from 'react'
import { api } from './api.js'
import Navbar     from './components/Navbar.jsx'
import Hero       from './components/Hero.jsx'
import Services   from './components/Services.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Reviews    from './components/Reviews.jsx'
import CtaBand    from './components/CtaBand.jsx'
import Footer     from './components/Footer.jsx'
import LoginModal from './components/LoginModal.jsx'
import Dashboard  from './components/Dashboard.jsx'

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [session,   setSession]   = useState(null)
  const [bookings,  setBookings]  = useState([])
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [apiError,  setApiError]  = useState('')

  // Re-hydrate session from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('aq_token')
    if (!token) return
    api.auth.me()
      .then(data => setSession(data.user))
      .catch(() => localStorage.removeItem('aq_token'))
  }, [])

  // Fetch bookings whenever session changes
  const fetchBookings = useCallback(async () => {
    if (!session) return
    try {
      const data = await api.bookings.list()
      setBookings(data)
    } catch (err) {
      setApiError(err.message)
    }
  }, [session])

  // Fetch employees whenever session changes
  const fetchEmployees = useCallback(async () => {
    if (!session) return
    try {
      const data = await api.employees.list()
      setEmployees(data)
    } catch (err) {
      setApiError(err.message)
    }
  }, [session])

  useEffect(() => {
    fetchBookings()
    fetchEmployees()
  }, [fetchBookings, fetchEmployees])

  async function handleLogin(username, password) {
    setLoading(true); setApiError('')
    try {
      const { token, user } = await api.auth.login(username, password)
      localStorage.setItem('aq_token', token)
      setSession(user)
      setLoginOpen(false)
    } catch (err) {
      throw err          // let LoginModal show the error
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('aq_token')
    setSession(null); setBookings([]); setEmployees([])
  }

  // ── Booking mutations ─────────────────────────────────────────
  async function createBooking(data) {
    const bk = await api.bookings.create(data)
    setBookings(prev => [...prev, bk])
    return bk
  }

  async function updateBooking(id, data) {
    const bk = await api.bookings.update(id, data)
    setBookings(prev => prev.map(b => b.id === id ? bk : b))
    return bk
  }

  async function patchBookingStatus(id, status) {
    const bk = await api.bookings.patchStatus(id, status)
    setBookings(prev => prev.map(b => b.id === id ? bk : b))
    return bk
  }

  // ── Employee mutations ────────────────────────────────────────
  async function createEmployee(data) {
    const emp = await api.employees.create(data)
    setEmployees(prev => [...prev, emp])
    return emp
  }

  async function updateEmployee(id, data) {
    const emp = await api.employees.update(id, data)
    setEmployees(prev => prev.map(e => e.id === id ? emp : e))
    return emp
  }

  async function patchEmployeeStatus(id, status) {
    const emp = await api.employees.patchStatus(id, status)
    setEmployees(prev => prev.map(e => e.id === id ? emp : e))
    return emp
  }

  async function deleteEmployee(id) {
    await api.employees.delete(id)
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      <Navbar onLoginClick={() => setLoginOpen(true)} />
      <main>
        <Hero /><Services /><HowItWorks /><Reviews /><CtaBand />
      </main>
      <Footer />

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLogin={handleLogin}
        />
      )}

      {apiError && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background:'rgba(255,77,106,.15)', border:'1px solid rgba(255,77,106,.4)',
          color:'#ff4d6a', padding:'10px 22px', borderRadius:10, zIndex:9999,
          fontSize:'.85rem', fontWeight:600,
        }}>
          ⚠️ {apiError}
          <button onClick={()=>setApiError('')} style={{marginLeft:12,background:'none',border:'none',color:'#ff4d6a',cursor:'pointer',fontSize:'1rem'}}>✕</button>
        </div>
      )}

      {session && (
        <Dashboard
          session={session}
          bookings={bookings}
          employees={employees}
          onLogout={handleLogout}
          onRefreshBookings={fetchBookings}
          createBooking={createBooking}
          updateBooking={updateBooking}
          patchBookingStatus={patchBookingStatus}
          createEmployee={createEmployee}
          updateEmployee={updateEmployee}
          patchEmployeeStatus={patchEmployeeStatus}
          deleteEmployee={deleteEmployee}
        />
      )}
    </>
  )
}
