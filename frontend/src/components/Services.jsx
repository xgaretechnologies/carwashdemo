// Services.jsx
import s from './Sections.module.css'
const SVC=[['🚿','Exterior Wash','Full-body rinse, foam soak, and high-pressure wash that removes dirt, grime, and road film.'],['✨','Full Detail','Interior vacuuming, dashboard wipe, window clean, and full exterior polish — inside and out.'],['🪞','Paint Polish','Clay bar treatment and machine polish to restore deep gloss and eliminate light scratches.'],['🛡️','Ceramic Coating','Long-lasting hydrophobic nano-ceramic layer that repels water, UV rays, and contaminants.'],['🍃','Eco Waterless Wash','Biodegradable waterless solution — zero runoff, same stunning results. Friendly to the planet.'],['🔧','Engine Bay Clean','Safe degreasing and detailing of the engine compartment for a showroom-ready appearance.']]
export default function Services() {
  return (
    <section id="services" className={s.section}>
      <p className={s.lbl}>What We Offer</p><h2 className={s.title}>Our <span>Services</span></h2>
      <div className={s.grid}>{SVC.map(([ic,t,d])=><div key={t} className={s.card}><div className={s.icon}>{ic}</div><h3>{t}</h3><p>{d}</p></div>)}</div>
    </section>
  )
}
