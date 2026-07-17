import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ColmeiaView from "../components/ColmeiaView"
import "../portfolio.css"

export default function ColmeiaPage() {
  const navigate = useNavigate()
  const [navShadow, setNavShadow] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavShadow(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav id="nav" style={{ boxShadow: navShadow ? '0 4px 24px rgba(0,0,0,.3)' : 'none' }}>
        <a href="/" className="nav-logo">
          <img src="images/logo.png" alt="ETIPI" style={{ height: '48px', width: 'auto', display: 'block', borderRadius: '10px' }} />
        </a>
        <ul className="nav-links">
          <li><a href="/#carousel">Produtos</a></li>
          <li><a href="/#verticais">Verticais</a></li>
          <li><a href="/#catalogo">Catálogo</a></li>
          <li><a href="/#clientes">Clientes</a></li>
          <li><a href="/#contato">Contato</a></li>
        </ul>
        <button className="nav-cta" onClick={() => navigate('/#contato')}>Fale Conosco</button>
      </nav>

      <section className="sec" style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="rev" style={{ marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-o"
            style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >← Voltar para a página principal</button>
          <span className="sec-lbl">Catálogo Completo</span>
          <h2 className="sec-title">Visualização Colmeia</h2>
          <p className="sec-sub">Explore o portfólio completo em uma visualização interativa por vertical de atuação.</p>
        </div>
        <ColmeiaView />
      </section>

      <footer>
        <div className="ft">
          <div><div className="fl"><b>ETi</b>Pi</div><div className="ft-tag">Empresa de Tecnologia da Informação do Estado do Piauí</div></div>
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,.4)', fontSize: '.78rem', lineHeight: '1.9' }}>
            <div>Av. Pedro Freitas, 1900 — Teresina/PI</div>
            <div>DIN@ETIPI.PI.GOV.BR</div>
            <div>WWW.ETIPI.PI.GOV.BR</div>
          </div>
        </div>
        <div className="fb">
          <span>© 2025 ETIPI — Empresa de Tecnologia da Informação do Piauí</span>
          <span>Dispensa de licitação — Art. 75, IX, Lei nº 14.133/2021</span>
        </div>
        <div className="fc" />
      </footer>
    </>
  )
}
