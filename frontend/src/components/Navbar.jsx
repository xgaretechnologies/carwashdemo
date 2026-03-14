import { useState } from 'react'
import s from './Navbar.module.css'

const LINKS = [['Services', '#services'], ['How It Works', '#how'], ['Reviews', '#reviews'], ['Contact', '#contact']]

export default function Navbar({ onLoginClick }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <nav className={s.nav}>
        <a href="#" className={s.logo}>Vernon Auto<span>Detailing</span></a>
        <ul className={s.links}>{LINKS.map(([l, h]) => <li key={l}><a href={h}>{l}</a></li>)}</ul>
        <div className={s.right}>
          <button className={s.loginBtn} onClick={onLoginClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Staff Login
          </button>
        </div>
        <button className={s.burger} onClick={() => setOpen(o => !o)}><span /><span /><span /></button>
      </nav>
      {open && (
        <div className={s.mobile}>
          {LINKS.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)}>{l}</a>)}
          <button className={s.loginBtn} onClick={() => { setOpen(false); onLoginClick() }}>Staff Login</button>
        </div>
      )}
    </>
  )
}
