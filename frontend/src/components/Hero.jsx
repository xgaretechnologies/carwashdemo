// Hero.jsx
import { useEffect, useRef } from 'react'
import s from './Hero.module.css'

export default function Hero() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('div'); d.className = 'drop'
      d.style.left = Math.random()*100+'%'; d.style.height = (40+Math.random()*80)+'px'
      d.style.animationDuration = (3+Math.random()*5)+'s'; d.style.animationDelay = (Math.random()*6)+'s'
      c.appendChild(d)
    }
    return () => { c.innerHTML = '' }
  }, [])
  return (
    <section className={s.hero}>
      <div className={s.bg}/>
      <div className={s.drops} ref={ref}/>
      <div className={s.content}>
        <div className={s.badge}>Premium Car Care Center</div>
        <h1>YOUR CAR<br/><span className={s.hl}>DESERVES</span><br/>THE SHINE</h1>
        <p className={s.sub}>Professional car washing and detailing services that restore your vehicle's brilliance — fast, eco-friendly, and spotless.</p>
        <div className={s.btns}>
          {/* Book a Wash — commented out; handled by staff */}
          <a href="#services" className={s.outline}>Explore Services</a>
          <a href="#how" className={s.outline}>How It Works</a>
        </div>
      </div>
      <div className={s.stats}>
        {[['12K+','Happy Customers'],['98%','Satisfaction Rate'],['8 Yrs','In Business'],['30min','Avg. Service Time']].map(([n,l])=>(
          <div key={l} className={s.stat}><div className={s.statN}>{n}</div><div className={s.statL}>{l}</div></div>
        ))}
      </div>
    </section>
  )
}
