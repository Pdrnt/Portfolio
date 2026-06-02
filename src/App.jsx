import { useState, useEffect } from "react"
import "./portfolio.css"
import MapaHolograma from "./components/MapaHolograma"
import ProposalCard from "./components/ProposalCard"
import { PRODUCTS, CAROUSEL_ITEMS, CATALOG_ITEMS } from "./data/products"

const DOUBLED_CAROUSEL = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS]

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'adm', label: 'Administração' },
  { id: 'sau', label: 'Saúde' },
  { id: 'edu', label: 'Educação' },
  { id: 'seg', label: 'Segurança' },
  { id: 'red', label: 'Redes & TI' },
  { id: 'gov', label: 'Governo Digital' },
]

export default function App() {
  const [navShadow, setNavShadow] = useState(false)
  const [activeFilter, setActiveFilter] = useState('todos')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    const onScroll = () => setNavShadow(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setModal(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('in'), i * 70)
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.rev').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [activeFilter])

  const showItem = (item) =>
    activeFilter === 'todos' ||
    (activeFilter === 'super' && item.isSuper) ||
    activeFilter === item.cat

  const openProduct = (key) => setModal(PRODUCTS[key] || null)

  const scrollToContato = () =>
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* NAV */}
      <nav id="nav" style={{ boxShadow: navShadow ? '0 4px 24px rgba(0,0,0,.3)' : 'none' }}>
        <a href="#hero" className="nav-logo">
          <img src="images/logo.png" alt="ETIPI" style={{ height: '48px', width: 'auto', display: 'block', borderRadius: '10px' }} />
        </a>
        <ul className="nav-links">
          <li><a href="#carousel">Produtos</a></li>
          <li><a href="#verticais">Verticais</a></li>
          <li><a href="#catalogo">Catálogo</a></li>
          <li><a href="#clientes">Clientes</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
        <button className="nav-cta" onClick={scrollToContato}>Fale Conosco</button>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hex-bg"><div /><div /><div /><div /><div /><div /></div>
        <div className="hero-pill">A Casa da Tecnologia</div>
        <h1 className="hero-h">Soluções em Tecnologia e<br /><em>Inovação a Serviço</em><br />do Cidadão</h1>
        <p className="hero-p">A ETIPI é a Empresa de Tecnologia da Informação do Estado do Piauí — desenvolvemos plataformas digitais que modernizam a gestão pública e transformam a vida dos cidadãos.</p>
        <div className="hero-btns">
          <a href="#carousel" className="btn-p">Ver Portfólio Completo</a>
          <a href="#contato" className="btn-o">Contratar sem Licitação</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><div className="stat-n">30<em>+</em></div><div className="stat-l">Produtos &amp; Serviços</div></div>
          <div className="stat"><div className="stat-n">6</div><div className="stat-l">Verticais de Inovação</div></div>
          <div className="stat"><div className="stat-n">5<em>+</em></div><div className="stat-l">Estados Atendidos</div></div>
          <div className="stat"><div className="stat-n">300<em>+</em></div><div className="stat-l">Serviços Digitais</div></div>
        </div>
        <div className="hero-cut" />
      </section>

      <div className="stripe" />

      {/* CAROUSEL */}
      <section className="sec" id="carousel">
        <div className="rev">
          <span className="sec-lbl">Destaques do Portfólio</span>
          <h2 className="sec-title">Super Produtos &amp; Soluções</h2>
          <p className="sec-sub">Conheça as principais soluções que transformam a gestão pública em todo o Brasil.</p>
        </div>
        <div className="carousel-wrap">
          <div className="fade-l" />
          <div className="fade-r" />
          <div className="carousel-track">
            {DOUBLED_CAROUSEL.map((item, i) => (
              <div key={i} className="pc" onClick={() => openProduct(item.key)}>
                <img className="pc-img" src={item.img} alt={item.name} />
                <div className="pc-body">
                  <div className={`pc-badge ${item.badge}`}>{item.badgeText}</div>
                  <div className="pc-vert">{item.vert}</div>
                  <div className="pc-name">{item.name}</div>
                  <div className="pc-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERTICAIS */}
      <section className="sec sec-alt" id="verticais">
        <div className="rev">
          <span className="sec-lbl">Áreas de Atuação</span>
          <h2 className="sec-title">Verticais de Inovação</h2>
          <p className="sec-sub">Seis frentes estratégicas cobrindo todas as necessidades da gestão pública digital.</p>
        </div>
        <div className="vg">
          <div className="vc vc-adm rev"><div className="vi vi-adm">⚙️</div><div className="vc-t">Administração</div><div className="vc-d">Automação de processos, sistemas financeiros, fiscais, gestão de pessoas e governança pública.</div><span className="vc-c">10 soluções</span></div>
          <div className="vc vc-sau rev"><div className="vi vi-sau">🏥</div><div className="vc-t">Saúde</div><div className="vc-d">Telessaúde, prontuário eletrônico, gestão hospitalar, IA para prontuários e atendimento a servidores.</div><span className="vc-c">6 soluções</span></div>
          <div className="vc vc-edu rev"><div className="vi vi-edu">📚</div><div className="vc-t">Educação</div><div className="vc-d">Plataformas para escolas públicas, educação corporativa, primeira infância e mediação tecnológica.</div><span className="vc-c">4 soluções</span></div>
          <div className="vc vc-seg rev"><div className="vi vi-seg">🛡️</div><div className="vc-t">Segurança Pública e Trânsito</div><div className="vc-d">Identificação civil, rastreamento de dispositivos, registro de ocorrências e gestão de fundos.</div><span className="vc-c">4 soluções</span></div>
          <div className="vc vc-red rev"><div className="vi vi-red">🌐</div><div className="vc-t">Redes e Serviços de TI</div><div className="vc-d">Data center Tier III, conectividade por fibra e satélite, NOC, SOC, HaaS e nuvem governamental.</div><span className="vc-c">13 soluções</span></div>
          <div className="vc vc-gov rev"><div className="vi vi-gov">🏛️</div><div className="vc-t">Governo Digital</div><div className="vc-d">Digitalização e acessibilidade ao cidadão com 300+ serviços integrados ao Gov.br.</div><span className="vc-c">1 super produto</span></div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="sec" id="catalogo">
        <div className="rev">
          <span className="sec-lbl">Catálogo Completo</span>
          <h2 className="sec-title">Todos os Produtos</h2>
          <p className="sec-sub">Explore o portfólio completo filtrando por vertical de atuação.</p>
        </div>
        <div className="prod-tabs">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`tab${activeFilter === f.id ? ' on' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >{f.label}</button>
          ))}
        </div>
        <div className="pg">
          {CATALOG_ITEMS.filter(showItem).map((item) => (
            <div key={item.key + item.cat} className="pi" onClick={() => openProduct(item.key)}>
              <img className="pi-img" src={item.img} alt={item.name} />
              <div className="pi-body">
                <div className="pi-top">
                  <div className="pi-name">{item.name}</div>
                  <span className={`pc-badge ${item.badge}`} style={{ fontSize: '.62rem', padding: '2px 7px', whiteSpace: 'nowrap' }}>{item.badgeText}</span>
                </div>
                <div className="pi-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLIENTES + MAPA */}
      <section className="sec sec-dark" id="clientes">
        <div className="clientes-layout">
          <div className="clientes-left">
            <div className="rev">
              <span className="sec-lbl">Nossos Clientes</span>
              <h2 className="sec-title">Atuamos em Todo o Brasil</h2>
              <p className="sec-sub">Atendemos órgãos públicos estaduais, municipais e autarquias, levando tecnologia que transforma a gestão pública.</p>
            </div>
            <div className="cases rev">
              <div className="cc"><div className="cc-s">🌿 Amazonas</div><div className="cc-d">Telessaúde Digital no programa Saúde AM Digital, levando atendimento especializado a regiões remotas.</div></div>
              <div className="cc"><div className="cc-s">🌳 Pará</div><div className="cc-d">Telessaúde IASEP com teleconsultas para segurados e dependentes do Instituto de Assistência dos Servidores.</div></div>
              <div className="cc"><div className="cc-s">🌻 Pernambuco</div><div className="cc-d">Parcerias em gestão de estoque e saúde pública, incluindo o Credencia PE na administração.</div></div>
              <div className="cc"><div className="cc-s">🌾 Goiás</div><div className="cc-d">Implantação do Sistema de Gestão de Pessoas para modernização da administração de servidores.</div></div>
            </div>
            <div className="chips rev">
              <div className="chip">Governo do Piauí</div><div className="chip">Secretarias Estaduais</div>
              <div className="chip">Prefeituras Municipais</div><div className="chip">Poder Judiciário</div>
              <div className="chip">Ministério Público</div><div className="chip">Autarquias</div>
              <div className="chip">Controladoria Geral</div><div className="chip">Tribunais de Contas</div>
              <div className="chip">Consórcios Municipais</div><div className="chip">IASPI Saúde</div>
            </div>
          </div>
          <div className="clientes-right rev">
            <span className="sec-lbl"></span>
            <h2 className="sec-title">Nossa Sede &amp; Órgãos Parceiros</h2>
            <p className="sec-sub">Clique no Piauí para explorar o mapa interativo de Teresina com a localização dos nossos parceiros institucionais.</p>
            <div className="mapa-container">
              <MapaHolograma onOrgaoSelect={() => {}} />
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="sec sec-alt" id="contato">
        <div className="rev">
          <span className="sec-lbl">Entre em Contato</span>
          <h2 className="sec-title">Converse com a ETIPI</h2>
          <p className="sec-sub">Sabemos qual a melhor solução para a gestão pública. Nossa equipe está pronta para apresentar as opções ideais para o seu órgão.</p>
          <div className="ci-list">
            <div className="ci-item"><div className="ci-ico">📍</div><div className="ci-txt"><strong>Endereço</strong>Av. Pedro Freitas, 1900, Bairro São Pedro, Teresina/PI — CEP 64018-900</div></div>
            <div className="ci-item"><div className="ci-ico">🌐</div><div className="ci-txt"><strong>Portal Oficial</strong>WWW.ETIPI.PI.GOV.BR</div></div>
            <div className="ci-item"><div className="ci-ico">⚖️</div><div className="ci-txt"><strong>Contratação Direta</strong>Dispensa de licitação — Art. 75, IX, Lei nº 14.133/2021</div></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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

      {/* FLOATING PROPOSAL CARD */}
      <ProposalCard />

      {/* MODAL */}
      <div
        className={`modal-overlay${modal ? ' open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
      >
        {modal && (
          <div className="modal-panel">
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <img className="modal-img" src={modal.img} alt={modal.name} />
            <div className="modal-body">
              <div dangerouslySetInnerHTML={{ __html: modal.badge }} />
              <div className="modal-vert">{modal.vertical}</div>
              <div className="modal-name">{modal.name}</div>
              <div className="modal-intro">{modal.intro}</div>
              <div className="modal-pv-title">Proposta de Valor</div>
              <div className="modal-pv" dangerouslySetInnerHTML={{ __html: modal.pv }} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
