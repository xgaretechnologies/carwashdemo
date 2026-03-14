import s from './Sections.module.css'
const REV = [['JR', 'James R.', 'BMW 5 Series Owner', '"My car looks better than the day I bought it. The ceramic coating they did is absolutely flawless — water just beads right off."'], ['SK', 'Sarah K.', 'Toyota RAV4 Owner', '"Fast, friendly, and incredibly thorough. I booked the full detail and they had my SUV done in under 45 minutes. Will be back every week."'], ['DM', 'David M.', 'Tesla Model 3 Owner', '"I love that they offer an eco waterless option. Great for the environment and the car came out spotless. Highly recommend VernonAutoDetailing!"']]
export default function Reviews() {
  return (
    <section id="reviews" className={`${s.section} ${s.dark}`}>
      <p className={s.lbl}>Testimonials</p><h2 className={s.title}>What Customers <span>Say</span></h2>
      <div className={s.revGrid}>{REV.map(([ini, n, sub, txt]) => (
        <div key={n} className={s.revCard}>
          <div className={s.stars}>★★★★★</div><p className={s.revTxt}>{txt}</p>
          <div className={s.reviewer}><div className={s.av}>{ini}</div><div><div className={s.rn}>{n}</div><div className={s.rs}>{sub}</div></div></div>
        </div>
      ))}</div>
    </section>
  )
}
