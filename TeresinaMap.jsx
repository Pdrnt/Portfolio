/**
 * TeresinaMap.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Mapa de Teresina usando mapbox-gl.
 *
 * Funcionalidades:
 *   - Mapa interativo centralizado em Teresina
 *   - Toggle de estilo: Escuro (dark-v11) / Satélite (satellite-streets-v12)
 *   - Suporte a pins via ref exposta (markersRef)
 *   - Cleanup automático ao desmontar
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import "../styles/teresina-map.css"

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// CENTER e ZOOM serão definidos dinamicamente abaixo

const STYLES = {
  dark:      "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
}

// ─── Órgãos / parceiros com pin de imagem ─────────────────────────────────
const ORGAOS = [
  {
    nome:      "ETIPI — Sede",
    sigla:     "ETIPI",
    produto:   "Soluções em TI",
    descricao: "Empresa de Tecnologia da Informação do Piauí",
    produtos:  ["Educação", "Saúde", "Admnistração", "Infraestrutura", "Segurança Pública", "Inteligencia Artifical (Em Breve)"],
    imagem:    "/imgs/etipi.png",
    coords:    [-42.813238961122124, -5.109161774165714],
  },
  {
    nome:      "Secretaria de Estado da Educação do Piauí",
    sigla:     "SEDUC",
    produto:   "Educação",
    descricao: "Secretaria de Estado da Educação do Piauí",
    produtos:  ["Gestão Escolar", "Sistemas Educacionais", "Dados Acadêmicos"],
    imagem:    "/imgs/seduc.png",
    coords:    [-42.81289495158383, -5.109956796047524],
  },
  {
    nome:      "Assembleia Legislativa do Estado do Piauí",
    sigla:     "ALEPI",
    produto:   "HAAS IMPRESSORAS",
    descricao: "Assembleia Legislativa do Estado do Piauí",
    produtos:  ["HAAS IMPRESSORAS"],
    imagem:    "/imgs/alepi.png",
    coords:    [-42.79814453228637, -5.081588754896597],
  },
  {
    nome:      "Ministério Público do Estado do Piauí",
    sigla:     "MPPI",
    produto:   "Certificado Digital",
    descricao: "Ministério Público do Estado do Piauí",
    produtos:  ["Certificado Digital"],
    imagem:    "/imgs/mppi.png",
    coords:    [-42.793902216943025, -5.067135160372636],
  },
  {
    nome:      "Defensoria Pública do Piauí",
    sigla:     "DPE - PI",
    produto:   "Pacote personalizado SEI, com manutenção de site e certificado digital",
    descricao: "Defensoria Pública do Piauí",
    produtos:  ["Pacote personalizado SEI, com manutenção de site e certificado digital"],
    imagem:    "/imgs/dpe.png",
    coords:    [-42.79024373532656, -5.080600435493667],
  },
  {
    nome:      "Reabilitar",
    sigla:     "Reabilitar",
    produto:   "Pacote personalizado SEI, com manutenção de site e certificado digital",
    descricao: "Reabilitar",
    produtos:  ["Pacote personalizado SEI, com manutenção de site e certificado digital"],
    imagem:    "/imgs/reabilitar.png",
    coords:    [-42.79734756956549, -5.069091435331383],
  },
  {
    nome:      "Secretaria da Assistência Técnica e Defesa Agropecuária do Piauí",
    sigla:     "SADA - PI",
    produto:   "Fábrica de software",
    descricao: "SADA - PI",
    produtos:  ["Fábrica de software"],
    imagem:    "/imgs/sada.png",
    coords:    [-42.82773660345072, -5.07425599880546],
  },
  {
    nome:      "Secretaria da Administração do Estado do Piauí",
    sigla:     "SEAD - PI",
    produto:   "Cabeamento",
    descricao: "SEAD - PI",
    produtos:  ["Cabeamento"],
    imagem:    "/imgs/sead.png",
    coords:    [-42.81349794154175, -5.108802722298749],
  },
  {
    nome:      "Secretaria de Estado da Saúde do Piauí",
    sigla:     "SESA - PI",
    produto:   "CREDSUS, GuardVisio, HAAS IMPRESSORAS, Prontuário eletrônico",
    descricao: "SESA - PI",
    produtos:  ["CREDSUS", "GuardVisio", "HAAS IMPRESSORAS", "Prontuário eletrônico"],
    imagem:    "/imgs/sesa.png",
    coords:    [-42.813383219060945, -5.111158759684276],
  },
  {
    nome:      "Secretaria de Segurança Pública do Estado do Piauí",
    sigla:     "SSP - PI",
    produto:   "SPIA, RG Nacional",
    descricao: "SSP - PI",
    produtos:  ["SPIA", "RG Nacional"],
    imagem:    "/imgs/ssp.png",
    coords:    [-42.77263061616608, -5.0814904869926565],
  },
]

// Centro inicial fixo na sede (ETIPI)
const SEDE = ORGAOS.find((o) => o.sigla === "ETIPI")
const CENTER = SEDE ? SEDE.coords : ORGAOS[0].coords
const ZOOM   = 9   // zoom inicial baixo — flyTo anima a entrada até 15.5

// ─── Painel lateral de detalhes ─────────────────────────────────────────────────
function DetalhePanel({ orgao, onClose }) {
  const isEtipi = orgao?.sigla === "ETIPI"

  return (
    <aside className={`tmap-panel${orgao ? " tmap-panel--visible" : ""}`} aria-live="polite">
      {/* Back arrow (desselect) */}
      <button className="tmap-panel__back" onClick={onClose} aria-label="Voltar">←</button>

      {/* Existing close (keeps behavior) */}
      <button className="tmap-panel__close" onClick={onClose} aria-label="Fechar painel">×</button>

      {isEtipi ? (
        <div className="tmap-etipi-flip-card">
          <div className="tmap-etipi-flip-card__inner">
            <div className="tmap-etipi-flip-card__face tmap-etipi-flip-card__front">
              <img className="tmap-panel__avatar" src={orgao?.imagem} alt={orgao?.nome} />
              <div className="tmap-panel__header">
                <p className="tmap-panel__sigla">{orgao?.sigla}</p>
                <strong className="tmap-panel__nome">{orgao?.nome}</strong>
              </div>
              <div className="tmap-panel__divider" />
              <div className="tmap-panel__servicos">
                <p className="tmap-panel__servicos-label">VERTICAIS</p>
                <ul className="tmap-panel__lista">
                  {orgao?.produtos?.map((p) => (
                    <li key={p} className="tmap-panel__item">
                      <span className="tmap-panel__dot" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

      <div className="tmap-etipi-flip-card__face tmap-etipi-flip-card__back">
        <img className="tmap-etipi-flip-card__photo" src="/imgs/ellen.png" alt="Ellen Gera" />
        <div className="tmap-etipi-flip-card__name">Ellen Gera</div>
        <div className="tmap-etipi-flip-card__role">Presidente da ETIPI</div>
      </div>
          </div>
        </div>
      ) : (
        <>
          <img className="tmap-panel__avatar" src={orgao?.imagem} alt={orgao?.nome} />
          <div className="tmap-panel__header">
            <p className="tmap-panel__sigla">{orgao?.sigla}</p>
            <strong className="tmap-panel__nome">{orgao?.nome}</strong>
          </div>
          <div className="tmap-panel__divider" />
          <div className="tmap-panel__servicos">
            <p className="tmap-panel__servicos-label">PRODUTOS</p>
            <ul className="tmap-panel__lista">
              {orgao?.produtos?.map((p) => (
                <li key={p} className="tmap-panel__item">
                  <span className="tmap-panel__dot" />{p}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </aside>
  )
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function TeresinaMap({ onBack = null, onOrgaoSelect = null }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])       // referência pública para adicionar pins

  const [activeStyle,    setActiveStyle]    = useState("dark")
  const [mapReady,       setMapReady]       = useState(false)
  const [selectedOrgao,  setSelectedOrgao]  = useState(null)

  // ── Inicializar mapa ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (!MAPBOX_TOKEN) {
      console.warn("VITE_MAPBOX_TOKEN nao definido.")
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container:  containerRef.current,
      style:      STYLES[activeStyle],
      center:     CENTER,
      zoom:       ZOOM,
      antialias:  true,
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left")

    map.on("load", () => {
      // Voo de entrada: zoom-in suave sobre a maior concentração de pins
      map.flyTo({
        center: CENTER,
        zoom:   15.5,
        speed:  0.8,
        curve:  1.4,
      })
      setMapReady(true)
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Trocar estilo sem recriar o mapa ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return
    mapRef.current.setStyle(STYLES[activeStyle])
  }, [activeStyle, mapReady])

  // ── Notificar pai quando orgão selecionado muda ────────────────────────
  // useLayoutEffect (não useEffect) garante que onOrgaoSelect dispare *antes*
  // do browser pintar. Assim DashboardDIN atualiza isZoomed no mesmo frame
  // que TeresinaMap abre o painel — elimina o frame intermediário onde o Hero
  // ainda aparece na coluna esquerda enquanto o mapa já expandiu.
  useLayoutEffect(() => {
    // Inform the parent with a small hint about source so the parent
    // can choose a different layout policy for Teresina selections.
    onOrgaoSelect?.(selectedOrgao ? { ...selectedOrgao, __source: 'teresina' } : null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgao])

  // ── Criar pins: avatar circular + clique abre card ─────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Limpar pins anteriores (ex: após troca de estilo)
    markersRef.current.forEach(({ marker }) => marker.remove())
    markersRef.current = []

    ORGAOS.forEach((orgao) => {
      const el      = document.createElement("div")
      el.className  = "tmap-pin"
      el.tabIndex   = 0
      el.setAttribute("role", "button")
      el.setAttribute("aria-label", `Abrir detalhes de ${orgao.nome}`)
      // Centraliza o elemento exatamente sobre a coordenada
      el.style.display         = "flex"
      el.style.alignItems      = "center"
      el.style.justifyContent  = "center"
      el.style.transform       = "translate(-50%, -50%)"

      const img     = document.createElement("img")
      img.src       = orgao.imagem
      img.alt       = orgao.nome
      // Apply a larger, branded variant for ETIPI sede
      img.className = orgao.sigla === "ETIPI" ? "tmap-pin__img tmap-pin__img--etipi" : "tmap-pin__img"
      el.appendChild(img)

      // Hover: scale suave via classe CSS
      el.addEventListener("mouseenter", () => el.classList.add("tmap-pin--hovered"))
      el.addEventListener("mouseleave", () => el.classList.remove("tmap-pin--hovered"))

      // Clique: abre card de detalhes (React state)
      el.addEventListener("click", () => setSelectedOrgao(o => o?.nome === orgao.nome ? null : orgao))
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setSelectedOrgao(o => o?.nome === orgao.nome ? null : orgao)
        }
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(orgao.coords)
        .addTo(mapRef.current)

      markersRef.current.push({ marker })
    })

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current = []
    }
  }, [mapReady])

  // ── Redimensionar canvas após animação do layout (650ms > 600ms transition) ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return
    const t = setTimeout(() => mapRef.current?.resize(), 650)
    return () => clearTimeout(t)
  }, [selectedOrgao, mapReady])

  return (
    <section className={`tmap-secao tmap-secao--fade-in${selectedOrgao ? " tmap-secao--expanded" : ""}`}>
      {/* ── Cabeçalho: recua ao selecionar ──────────────────────────────────── */}
      <header className={`tmap-header${selectedOrgao ? " tmap-header--hidden" : ""}`}>
        {onBack && (
          <button className="tmap-btn-back" onClick={onBack} aria-label="Voltar para o Piauí">
            ← PIAUÍ
          </button>
        )}
        <p className="tmap-header__eyebrow">SISTEMA / PRESENÇA GEOGRÁFICA</p>
        <h2 className="tmap-header__title">
          TERESINA — <span>SEDE</span>
        </h2>
      </header>

      {/* ── Área do mapa + painel lateral (foco 70/30) ──────────────────── */}
      <div className={`tmap-map-area${selectedOrgao ? " tmap-map-area--focus" : ""}`}>
        <div className={`tmap-wrapper${selectedOrgao ? " tmap-wrapper--focus" : ""}`}>
          <div ref={containerRef} className="tmap-container" />

          <div className="tmap-style-toggle" role="group" aria-label="Estilo do mapa">
            <button
              className={`tmap-style-btn${activeStyle === "dark" ? " tmap-style-btn--active" : ""}`}
              onClick={() => setActiveStyle("dark")}
            >
              Escuro
            </button>
            <button
              className={`tmap-style-btn${activeStyle === "satellite" ? " tmap-style-btn--active" : ""}`}
              onClick={() => setActiveStyle("satellite")}
            >
              Satélite
            </button>
          </div>

          {!mapReady && (
            <div className="tmap-loading" aria-live="polite">
              <span className="tmap-loading__dot" />
              <span className="tmap-loading__dot" />
              <span className="tmap-loading__dot" />
            </div>
          )}

          <div className="tmap-corner tmap-corner--tl" aria-hidden="true" />
          <div className="tmap-corner tmap-corner--tr" aria-hidden="true" />
          <div className="tmap-corner tmap-corner--bl" aria-hidden="true" />
          <div className="tmap-corner tmap-corner--br" aria-hidden="true" />
        </div>

        {/* Painel lateral: DOM sempre presente, visibilidade via CSS */}
        <DetalhePanel
          orgao={selectedOrgao}
          onClose={() => {
            // Clear selection
            setSelectedOrgao(null)
            // Scroll to top so user returns to the page top when closing
            // the orgão detail panel. Small timeout ensures layout updates first.
            setTimeout(() => {
              try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (e) { /* noop */ }
            }, 60)
          }}
        />
      </div>
    </section>
  )
}
