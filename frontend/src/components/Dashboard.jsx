import { useState, useEffect } from 'react'
import BookingsScreen from './BookingsScreen.jsx'
import ScheduleScreen from './ScheduleScreen.jsx'
import EmployeesScreen from './EmployeesScreen.jsx'
import s from './Dashboard.module.css'

const NAV_STAFF = [
  { key: 'bookings', icon: '📋', label: 'Bookings' },
  { key: 'schedule', icon: '🗓️', label: 'Schedule' },
]
const NAV_MANAGER = [
  { key: 'bookings', icon: '📋', label: 'Bookings' },
  { key: 'schedule', icon: '🗓️', label: 'Schedule' },
  { key: 'employees', icon: '👥', label: 'Employees' },
]

export default function Dashboard({
  session, bookings, employees, onLogout, onRefreshBookings,
  createBooking, updateBooking, patchBookingStatus,
  createEmployee, updateEmployee, patchEmployeeStatus, deleteEmployee,
}) {
  const [tab, setTab] = useState('bookings')
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const isManager = session.role === 'manager'
  const navItems = isManager ? NAV_MANAGER : NAV_STAFF
  const initials = session.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  function goTab(k) { setTab(k); setSideOpen(false) }

  return (
    <div className={s.shell}>
      {/* Mobile topbar */}
      <div className={s.mobileBar}>
        <button className={s.burgerBtn} onClick={() => setSideOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <span className={s.mobileLogo}>Vernon Auto<em>Detailing</em></span>
        <div className={s.mobileAv}>{initials}</div>
      </div>

      {sideOpen && <div className={s.sideOverlay} onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${s.sidebar} ${sideOpen ? s.sideOpen : ''}`}>
        <div className={s.sideTop}>
          <div className={s.sideLogo}>Vernon Auto<span>Detailing</span></div>
          <div className={s.sideRole}>{isManager ? '🏆 Manager' : '👷 Staff'}</div>
        </div>

        <nav className={s.sideNav}>
          {navItems.map(n => (
            <button
              key={n.key}
              className={`${s.navItem} ${tab === n.key ? s.navActive : ''}`}
              onClick={() => goTab(n.key)}
            >
              <span className={s.navIcon}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className={s.sideBottom}>
          <div className={s.userCard}>
            <div className={s.userAv}>{initials}</div>
            <div>
              <div className={s.userName}>{session.name}</div>
              <div className={s.userRole}>{session.role}</div>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={s.main}>
        {tab === 'bookings' && (
          <BookingsScreen
            bookings={bookings}
            session={session}
            createBooking={createBooking}
            updateBooking={updateBooking}
            patchBookingStatus={patchBookingStatus}
            onRefresh={onRefreshBookings}
          />
        )}
        {tab === 'schedule' && (
          <ScheduleScreen
            bookings={bookings}
            session={session}
            createBooking={createBooking}
            patchBookingStatus={patchBookingStatus}
            onRefresh={onRefreshBookings}
          />
        )}
        {tab === 'employees' && isManager && (
          <EmployeesScreen
            employees={employees}
            createEmployee={createEmployee}
            updateEmployee={updateEmployee}
            patchEmployeeStatus={patchEmployeeStatus}
            deleteEmployee={deleteEmployee}
          />
        )}
      </main>
    </div>
  )
}
