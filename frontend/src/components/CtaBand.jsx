import s from './Sections.module.css'
export default function CtaBand() {
  return (
    <section id="contact" className={s.cta}>
      <h2>READY FOR A <span>SHINE?</span></h2>
      <p>Give us a call or walk in. We're open 7 days a week, 7am – 9pm.</p>
      <div className={s.ctaBtns}>
        {/* Book a Wash — commented out; handled by staff
        <button className={s.btnPrimary}>Book a Wash</button>
        */}
        <a href="tel:+15551234567" className={s.btnPrimary}>📞 (555) 123-4567</a>
        <a href="#services" className={s.btnOutline}>View Services</a>
      </div>
    </section>
  )
}
