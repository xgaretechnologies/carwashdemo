import s from './Sections.module.css'
const STEPS=[['01','📅','Book a Slot','Call us or walk in — our staff will log your booking and assign a time slot instantly.'],['02','🚗','Drop Off or Pickup','Drive in or request pickup from your location. Our team gets started right away.'],['03','🧴','We Work Magic','Expert technicians use premium products to treat every inch of your vehicle.'],['04','🏁','Drive Away Clean',"Collect your gleaming car. We notify you when it's ready — always on time."]]
export default function HowItWorks() {
  return (
    <section id="how" className={`${s.section} ${s.dark}`}>
      <p className={s.lbl}>The Process</p><h2 className={s.title}>How It <span>Works</span></h2>
      <div className={s.steps}>{STEPS.map(([n,ic,t,d])=><div key={n} className={s.step}><div className={s.stepN}>{n}</div><div className={s.stepI}>{ic}</div><h4>{t}</h4><p>{d}</p></div>)}</div>
    </section>
  )
}
