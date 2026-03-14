import s from './Sections.module.css'
export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.footerGrid}>
        <div className={s.brand}>
          <a href="#" className={s.fLogo}>Vernon Auto<span>Detailing</span></a>
          <p>Premium car washing and detailing. We treat every car like it's our own.</p>
        </div>
        {[['Services', ['Exterior Wash', 'Full Detail', 'Paint Polish', 'Ceramic Coating', 'Eco Wash']],
        ['Company', ['About Us', 'Our Team', 'Careers', 'Blog']],
        ['Visit Us', ['142 Gloss Ave, Suite 1', 'Mon–Sun: 7am – 9pm', '(555) 123-4567', 'hello@VernonAutoDetailing.com']]
        ].map(([h, items]) => (
          <div key={h} className={s.fCol}>
            <h5>{h}</h5>
            <ul>{items.map(i => <li key={i}><a href="#">{i}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <div className={s.footerBottom}>
        <span>© 2026 VernonAutoDetailing. All rights reserved.</span>
        <div><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
      </div>
    </footer>
  )
}
