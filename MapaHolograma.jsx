/**
 * MapaHolograma.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Mapa interativo do Brasil com efeito visual holograma futurista.
 *
 * Funcionalidades:
 *   - Mapa do Brasil com todos os estados (azul neon, fundo escuro)
 *   - Hover em estado: destaque + tooltip com nome
 *   - Foco no Piauí (UF_05 code): zoom + municípios do piaui.json local
 *   - Pins: sede (grande), capital (médio), cidade (pequeno) — aparecem no foco
 *   - Animações: glow, pulsação, scan line, glitch periódico
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  memo,
} from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  useMapContext,
  useZoomPanContext,
} from "react-simple-maps"

// piaui.json fica em /public → carregado via fetch em runtime
import "../styles/mapa-holograma.css"
import TeresinaMap from "./TeresinaMap"

// ─── Configuração geográfica ────────────────────────────────────────────────
// GeoJSON dos estados brasileiros (fonte pública estável)
const BRAZIL_STATES_URL =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"

const DEFAULT_CENTER  = [-52, -14]
const DEFAULT_ZOOM    = 1
const PI_CENTER       = [-43, -7.5]
const PI_ZOOM         = 5
const ANIM_DURATION   = 650  // ms
const LOGO_HIDE_DELAY = 8000 // ms — tempo para ocultar logo ao ficar no foco

// ─── Estilos pré-definidos (evita alocação a cada render) ────────────────────
const STATE_STYLE_DEFAULT = {
  default: { fill: "rgba(0,40,90,0.50)",   stroke: "rgba(0,120,180,0.35)", strokeWidth: 0.4, outline: "none" },
  hover:   { fill: "rgba(0,160,230,0.26)", stroke: "#00c8ff", strokeWidth: 0.7, filter: "drop-shadow(0 0 4px rgba(0,160,220,0.4))", outline: "none" },
  pressed: { fill: "rgba(0,120,200,0.34)", stroke: "#00c8ff", outline: "none" },
}
// Estado com cidade parceira: fill mais vibrante + glow sutil
const STATE_STYLE_PARTNER = {
  default: { fill: "rgba(0,80,160,0.62)",  stroke: "rgba(0,180,255,0.55)", strokeWidth: 0.55, filter: "drop-shadow(0 0 5px rgba(0,160,255,0.30))", outline: "none" },
  hover:   { fill: "rgba(0,150,255,0.36)", stroke: "#00eaff", strokeWidth: 0.9, filter: "drop-shadow(0 0 8px rgba(0,200,255,0.55))", outline: "none" },
  pressed: { fill: "rgba(0,130,240,0.44)", stroke: "#00eaff", outline: "none" },
}
const STATE_STYLE_HOVERED = {
  default: { fill: "rgba(0,180,255,0.28)", stroke: "#00c8ff", strokeWidth: 0.8, filter: "drop-shadow(0 0 5px rgba(0,180,255,0.7))", outline: "none" },
  hover:   { fill: "rgba(0,180,255,0.28)", stroke: "#00c8ff", strokeWidth: 0.8, outline: "none" },
  pressed: { fill: "rgba(0,160,240,0.38)", stroke: "#00c8ff", outline: "none" },
}
const STATE_STYLE_PI_ACTIVE = {
  default: { fill: "rgba(0,200,255,0.28)", stroke: "#00eaff", strokeWidth: 1.0, filter: "drop-shadow(0 0 7px #00eaff)", outline: "none" },
  hover:   { fill: "rgba(0,220,255,0.40)", stroke: "#00eaff", strokeWidth: 1.2, filter: "drop-shadow(0 0 10px #00eaff)", outline: "none" },
  pressed: { fill: "rgba(0,200,255,0.28)", stroke: "#00eaff", strokeWidth: 1.0, outline: "none" },
}
// Camada de elevação holográfica — overlay sobre estados parceiros.
// pointerEvents desativado via CSS (.holo-elevation-layer { pointer-events:none })
const STATE_STYLE_ELEVATION = {
  default: { fill: "rgba(0,200,255,0.05)", stroke: "#00eaff", strokeWidth: 0.8, filter: "drop-shadow(0 0 5px rgba(0,234,255,0.55))", outline: "none" },
  hover:   { fill: "rgba(0,200,255,0.05)", stroke: "#00eaff", strokeWidth: 0.8, filter: "drop-shadow(0 0 5px rgba(0,234,255,0.55))", outline: "none" },
  pressed: { fill: "rgba(0,200,255,0.05)", stroke: "#00eaff", strokeWidth: 0.8, filter: "drop-shadow(0 0 5px rgba(0,234,255,0.55))", outline: "none" },
}
const MUN_STYLE = {
  default: { fill: "rgba(0,120,200,0.12)", stroke: "rgba(0,200,255,0.30)", strokeWidth: 0.2, outline: "none" },
  hover:   { fill: "rgba(0,190,255,0.24)", stroke: "rgba(0,220,255,0.6)",  strokeWidth: 0.35, outline: "none" },
  pressed: { fill: "rgba(0,160,255,0.28)", stroke: "rgba(0,220,255,0.7)",  outline: "none" },
}
const MUN_PARTNER_STYLE = {
  default: { fill: "rgba(0,30,90,0.82)",   stroke: "rgba(0,180,255,0.55)", strokeWidth: 0.3, outline: "none" },
  hover:   { fill: "rgba(0,40,110,0.88)",  stroke: "rgba(0,200,255,0.75)", strokeWidth: 0.4, outline: "none" },
  pressed: { fill: "rgba(0,30,90,0.82)",   stroke: "rgba(0,200,255,0.75)", outline: "none" },
}
const MUN_PARTNER_SELECTED_STYLE = {
  default: { fill: "rgba(0,50,140,0.95)",  stroke: "#00eaff", strokeWidth: 0.6, filter: "drop-shadow(0 0 4px #00eaff)", outline: "none" },
  hover:   { fill: "rgba(0,60,160,0.95)",  stroke: "#00eaff", strokeWidth: 0.7, filter: "drop-shadow(0 0 6px #00eaff)", outline: "none" },
  pressed: { fill: "rgba(0,50,140,0.95)",  stroke: "#00eaff", outline: "none" },
}
// Municípios com pacto (extraídos do PDF "Pactos Individuais - Gestão e Tecnologia")
// Mantém somente marcação visual/interativa; não altera limites territoriais.
const PARTNER_CITIES = new Set([
  "Água Branca", "Alto Longá", "Altos", "Alvorada do Gurguéia", "Aroeiras do Itaim",
  "Assunção do Piauí", "Avelino Lopes", "Barra D'Alcântara", "Barras", "Barreiras do Piauí",
  "Bela Vista do Piauí", "Bertolínia", "Betânia do Piauí", "Boa Hora", "Bom Jesus",
  "Bom Princípio do Piauí", "Buriti dos Lopes", "Cajazeiras do Piauí", "Campo Grande do Piauí",
  "Campo Largo do Piauí", "Canavieira", "Caracol", "Cocal", "Coivaras", "Colônia do Gurguéia",
  "Cristino Castro", "Demerval Lobão", "Dirceu Arcoverde", "Domingos Mourão", "Elesbão Veloso",
  "Eliseu Martins", "Fartura do Piauí", "Flores do Piauí", "Floresta do Piauí", "Francisco Santos",
  "Fronteiras", "Guaribas", "Hugo Napoleão", "Ilha Grande", "Inhuma", "Ipiranga do Piauí",
  "Isaías Coelho", "Itainópolis", "Jacobina do Piauí", "Jatobá do Piauí", "Joaquim Pires",
  "José de Freitas", "Júlio Borges", "Lagoa Alegre", "Lagoa do Piauí", "Luzilândia", "Madeiro",
  "Manoel Emídio", "Marcolândia", "Marcos Parente", "Massapê do Piauí", "Miguel Leão",
  "Monsenhor Gil", "Monsenhor Hipólito", "Monte Alegre do Piauí", "Morro Cabeça no Tempo",
  "Nossa Senhora de Nazaré", "Novo Oriente do Piauí", "Novo Santo Antônio", "Oeiras",
  "Olho D'Água do Piauí", "Padre Marcos", "Paes Landim", "Paquetá", "Patos do Piauí", "Pavussu",
  "Pedro II", "Pedro Laurentino", "Pimenteiras", "Queimada Nova", "Regeneração",
  "Ribeiro Gonçalves", "Santa Cruz dos Milagres", "Santa Rosa do Piauí", "Santo Antônio de Lisboa",
  "Santo Inácio do Piauí", "São Gonçalo do Gurguéia", "São Gonçalo do Piauí",
  "São João da Canabrava", "São João da Fronteira", "São João da Serra", "São João da Varjota",
  "São João do Arraial", "São João do Piauí", "São Julião", "São Luis do Piauí",
  "São Miguel da Baixa Grande", "São Miguel do Fidalgo", "São Raimundo Nonato", "Sebastião Leal",
  "Sigefredo Pacheco", "Sussuapara", "Tanque do Piauí", "Valença do Piauí", "Várzea Branca",
  "Vera Mendes", "Teresina",
])

// Dados informativos de cada cidade parceira
const PARTNER_CITY_DATA = Object.fromEntries(
  [...PARTNER_CITIES].map((cidade) => [
    cidade,
    {
      produto:
        cidade === "Teresina"
          ? "Verticais: Educação, Saúde, Admnistração, Infraestrutura, Segurança Pública, Inteligencia Artifical (Em Breve)"
          : "Pacto Gestão e Tecnologia",
    },
  ]),
)

// Pins nacionais — visíveis na visão geral do Brasil
const NATIONAL_PINS = [
  { id: "teresina", nome: "Teresina", coords: [-42.8016, -5.0919], tipo: "sede",    uf: "PI" },
  { id: "manaus",   nome: "Manaus",   coords: [-60.025,  -3.107],  tipo: "capital", uf: "AM" },
  { id: "belem",    nome: "Belém",    coords: [-48.490,  -1.455],  tipo: "capital", uf: "PA" },
  { id: "recife",   nome: "Recife",   coords: [-34.877,  -8.047],  tipo: "capital", uf: "PE" },
  { id: "goiania",  nome: "Goiânia",  coords: [-49.264, -16.686],  tipo: "capital", uf: "GO", raio: 6.25 },
  { id: "brasilia", nome: "Brasília", coords: [-47.930, -15.780],  tipo: "capital", uf: "DF", raio: 6.25, labelOffsetY: -3 },
]

// Estados que possuem cidades parceiras/pins — derivado estaticamente
// Mantemos 'MA' explicitamente para destacar Maranhão mesmo sem um pin de cidade.
const PARTNER_STATES = new Set([...NATIONAL_PINS.map(p => p.uf), 'MA'])

// ease-in-out cúbico
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Sede (único pin) ────────────────────────────────────────────────────────
const SEDE_COORDS = [-42.8016, -5.0919] // Teresina-PI

// ─── Utilitários ─────────────────────────────────────────────────────────────
/** Retorna a sigla do estado a partir das propriedades do GeoJSON */
function getSigla(geo) {
  const { sigla, UF, abbrev, name } = geo.properties || {}
  return sigla || UF || abbrev || name || ""
}

// ─── Pin nacional (Brasil geral) ──────────────────────────────────────────────────
// Renderizados apenas em !focusPI (displayZoom=1) — sem problema de escala.
// tipo="sede" usa <image> com logo; outros usam <circle> + label.
const PIN_SIZE = { capital: 8, cidade: 5 }

const PinNacional = memo(function PinNacional({ coords, tipo, nome, raio, labelOffsetY = 0 }) {
  if (tipo === "sede") {
    const R = 20  // raio do avatar
    return (
      <Marker coordinates={coords}>
        <g>
          <defs>
            {/* Clip circular — recorta a imagem como foto de perfil */}
            <clipPath id="clip-pin-sede-geral">
              <circle cx={0} cy={-(R + 6)} r={R} />
            </clipPath>
          </defs>
          {/* Fundo do círculo */}
          <circle
            cx={0} cy={-(R + 6)} r={R}
            fill="rgba(0,12,36,0.92)"
          />
          {/* Logo recortada no círculo */}
          <image
            href="/logo.png"
            x={-R} y={-(2 * R + 6)}
            width={2 * R} height={2 * R}
            preserveAspectRatio="xMidYMid meet"
            clipPath="url(#clip-pin-sede-geral)"
          />
          {/* Borda neon */}
          <circle
            cx={0} cy={-(R + 6)} r={R}
            fill="none"
            stroke="#00eaff"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 4px #00eaff)" }}
          />
          {/* Ponteiro triangular */}
          <path d="M-5,-6 L0,0 L5,-6 Z" fill="#00eaff"
            style={{ filter: "drop-shadow(0 0 3px #00eaff)" }} />
        </g>
      </Marker>
    )
  }
  const r = raio ?? PIN_SIZE[tipo] ?? PIN_SIZE.cidade
  return (
    <Marker coordinates={coords}>
      <g>
        <circle
          r={r}
          className={`holo-pin-nacional holo-pin-nacional--${tipo}`}
          vectorEffect="non-scaling-stroke"
        />
        <text y={r + 9 + labelOffsetY} textAnchor="middle" className="holo-pin-label">
          {nome}
        </text>
      </g>
    </Marker>
  )
})

// ─── Sub-componente: Pin Sede SVG — APENAS PONTEIRO ───────────────────────────────
// Os círculos halo/ring foram removidos: eles eram a causa dos "radares" vistos
// no modo zoom (a cada zoom=5 eles escalavam 5× e viravam anéis enormes).
// O visual completo (círculo + logo) é fornecido pelo HTML overlay LogoSede.
// O ponteiro usa scale(1/zoom) para manter tamanho visual fixo.
const PinSede = memo(function PinSede({ coords, zoom }) {
  const s = 1 / Math.max(zoom, 1)
  return (
    <Marker coordinates={coords}>
      <g transform={`scale(${s})`}>
        {/* Ponteiro triangular apontando para a coordenada da sede */}
        <path d="M-6,-7 L0,0 L6,-7 Z" fill="#00eaff"
          style={{ filter: "drop-shadow(0 0 3px #00eaff)" }} />
      </g>
    </Marker>
  )
})

// ─── Tracker: lê posição do ZoomableGroup e projeta coord da sede ────────────
// Renderizado dentro do ZoomableGroup (acesso ao contexto de zoom/pan e projeção).
// Retorna null — só comunica a posição projetada via callback.
function SedePositionTracker({ onPosition }) {
  const { projection } = useMapContext()
  const { x, y, k } = useZoomPanContext()
  useEffect(() => {
    if (!projection) return
    const [svgX, svgY] = projection(SEDE_COORDS)
    onPosition({ x: svgX * k + x, y: svgY * k + y })
  }, [projection, x, y, k, onPosition])
  return null
}

// ─── Logo Sede: overlay HTML — posição acompanha a coord de Teresina no mapa ─
// pixelPos: coordenadas brutas no espaço SVG (viewBox 800×490) pós-transform.
// Convertidas para % do container para funcionar com layout responsivo.
const SVG_W = 800
const SVG_H = 490

const LogoSede = memo(function LogoSede({ onActivate = null, pixelPos = null }) {
  const posStyle = pixelPos
    ? {
        left:      `${(pixelPos.x / SVG_W) * 100}%`,
        top:       `${(pixelPos.y / SVG_H) * 100}%`,
        transform: "translate(-50%, -100%) translateY(-6px)",
      }
    : {}
  return (
    <div
      className="holo-logo-sede"
      style={posStyle}
      role="button"
      tabIndex={0}
      aria-label="Abrir mapa de Teresina"
      onClick={onActivate || undefined}
      onKeyDown={(e) => {
        if (!onActivate) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onActivate()
        }
      }}
    >
      <div className="holo-logo-sede__circle">
        <img src="/logo.png" alt="" draggable={false} />
      </div>
      <div className="holo-logo-sede__pointer" aria-hidden="true" />
    </div>
  )
})

// ─── Sub-componente: Info card cidade parceira ────────────────────────────────
const CidadeDash = memo(function CidadeDash({ cidade, onClose }) {
  if (!cidade) return null
  return (
    <div className="holo-city-dash" role="status" aria-live="polite">
      <button className="holo-city-dash__close" onClick={onClose} aria-label="Fechar">×</button>
      <p className="holo-city-dash__name">{cidade.name}</p>
      <p className="holo-city-dash__produto">{cidade.produto}</p>
    </div>
  )
})

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const Tooltip = memo(function Tooltip({ text, x, y }) {
  if (!text) return null
  return (
    <div className="holo-tooltip" style={{ left: x + 14, top: y - 8 }}>
      {text}
    </div>
  )
})

// ─── Estado memoizado: re-renderiza só qdo isHovered/nivel/geo/isPartner mudam ──────────
// O comparador customizado ignora onEnter/onLeave/onClick (sempre recriadas como
// arrow functions pelo pai), garantindo que apenas as ~2 geographies que trocam
// de hover a cada evento sejam re-renderizadas (em vez das ~27 do Brasil).
const GeoState = memo(
  function GeoState({ geo, isHovered, nivel, isPartner, onEnter, onLeave, onClick }) {
    const sigla   = getSigla(geo)
    const isPiaui = sigla === "PI" || geo.properties?.name === "Piauí"
    const isSelected = isPiaui && nivel !== "brasil"
    let style
    if (isSelected)                    style = STATE_STYLE_PI_ACTIVE
    else if (isHovered)                style = STATE_STYLE_HOVERED
    else if (isPartner)                style = STATE_STYLE_PARTNER
    else                               style = STATE_STYLE_DEFAULT
    return (
      <Geography
        geography={geo}
        className={[
          isPartner ? "holo-state-partner" : "",
          isSelected ? "holo-state-selected" : "",
        ].filter(Boolean).join(" ")}
        style={style}
        role="button"
        tabIndex={0}
        aria-label={`Estado ${geo.properties?.name || sigla || ""}`}
        aria-pressed={isSelected}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
      />
    )
  },
  (prev, next) =>
    prev.isHovered === next.isHovered &&
    prev.nivel     === next.nivel     &&
    prev.geo       === next.geo       &&
    prev.isPartner === next.isPartner
)

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MapaHolograma({ onOrgaoSelect = null }) {
  // ── Estado do mapa ────────────────────────────────────────────────────────
  const [hoveredState,  setHoveredState]  = useState(null)
  // "brasil" | "piaui" | "teresina"
  const [nivel,         setNivel]         = useState("brasil")
  const [exiting,       setExiting]       = useState(false)
  const [tooltipText,   setTooltipText]   = useState("")
  const [tooltipPos,    setTooltipPos]    = useState({ x: 0, y: 0 })
  const [piauiGeoJSON,  setPiauiGeoJSON]  = useState(null)
  const [mapView,       setMapView]       = useState({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
  // ── Estado de interação ───────────────────────────────────────────────────
  const [logoVisivel,       setLogoVisivel]       = useState(true)
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null)
  const [isTouchDevice,     setIsTouchDevice]     = useState(false)
  const [sedePixelPos,      setSedePixelPos]      = useState(null)
  const handleSedePosition  = useCallback((pos) => setSedePixelPos(pos), [])

  const containerRef    = useRef(null)
  const glitchRef       = useRef(null)
  const animRef         = useRef(null)
  const animFromCenter  = useRef(DEFAULT_CENTER)
  const animFromZoom    = useRef(DEFAULT_ZOOM)
  const exitTimerRef    = useRef(null)
  const lastMoveTimeRef = useRef(0)

  // ── Limpar timer de saída ao desmontar ────────────────────────────────────
  useEffect(() => {
    return () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current) }
  }, [])

  // ── Carregar piaui.json de /public via fetch ─────────────────────────────
  useEffect(() => {
    let cancelled = false
    fetch("/piaui.json")
      .then(r => r.json())
      .then(data => { if (!cancelled) setPiauiGeoJSON(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(pointer: coarse)")
    const update = () => setIsTouchDevice(mq.matches)
    update()
    try {
      mq.addEventListener("change", update)
      return () => mq.removeEventListener("change", update)
    } catch {
      mq.addListener(update)
      return () => mq.removeListener(update)
    }
  }, [])

  // ── Smooth zoom / pan animation ─────────────────────────────────────────
  useEffect(() => {
    // Nível teresina é gerenciado pelo TeresinaMap (Mapbox), sem animação aqui
    if (nivel === "teresina") return
    const targetCenter = nivel === "piaui" ? PI_CENTER : DEFAULT_CENTER
    const targetZoom   = nivel === "piaui" ? PI_ZOOM   : DEFAULT_ZOOM
    const fromCenter   = [...animFromCenter.current]
    const fromZoom     = animFromZoom.current
    let start = null

    if (animRef.current) cancelAnimationFrame(animRef.current)

    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / ANIM_DURATION, 1)
      const t = easeInOutCubic(progress)
      const newCenter = [
        fromCenter[0] + (targetCenter[0] - fromCenter[0]) * t,
        fromCenter[1] + (targetCenter[1] - fromCenter[1]) * t,
      ]
      const newZoom = fromZoom + (targetZoom - fromZoom) * t
      animFromCenter.current = newCenter
      animFromZoom.current   = newZoom
      setMapView({ center: [...newCenter], zoom: newZoom })
      if (progress < 1) animRef.current = requestAnimationFrame(step)
    }

    animRef.current = requestAnimationFrame(step)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [nivel])

  // ── Glitch periódico — manipulação direta de classe (sem re-render) ──────
  useEffect(() => {
    glitchRef.current?.classList.remove("holo-map-wrapper--glitch")
    if (nivel !== "brasil") return
    let timerId
    const schedule = () => {
      timerId = setTimeout(() => {
        glitchRef.current?.classList.add("holo-map-wrapper--glitch")
        setTimeout(() => {
          glitchRef.current?.classList.remove("holo-map-wrapper--glitch")
          schedule()
        }, 220)
      }, 5000 + Math.random() * 2000)
    }
    schedule()
    return () => clearTimeout(timerId)
  }, [nivel])

  // ── Timer 8s: oculta logo após permanecer no foco ─────────────────────────
  useEffect(() => {
    // Ao voltar ao Brasil: restaura logo e limpa seleção de cidade
    if (nivel === "brasil") {
      setLogoVisivel(true)
      setCidadeSelecionada(null)
      return
    }
    // No mapa do Piauí a logo/pin da sede deve permanecer estática (sempre visível)
    if (nivel === "piaui") {
      setLogoVisivel(true)
      setCidadeSelecionada(null)
      return
    }
    // Ao mudar de nível: limpa seleção anterior e reinicia timer
    setCidadeSelecionada(null)
    setLogoVisivel(true)
    const timerId = setTimeout(() => setLogoVisivel(false), LOGO_HIDE_DELAY)
    return () => clearTimeout(timerId)
  }, [nivel])

  const openTeresinaFromPiaui = useCallback(() => {
    setExiting(true)
    exitTimerRef.current = setTimeout(() => {
      setNivel("teresina")
      setExiting(false)
    }, 450)
  }, [])

  // ── Handlers estado hover ─────────────────────────────────────────────────
  const handleStateEnter = useCallback((e, geo) => {
    const sigla = getSigla(geo)
    setHoveredState(sigla || geo.id)
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTooltipText(geo.properties?.name || sigla || "")
  }, [])

  const handleStateLeave = useCallback(() => {
    setHoveredState(null)
    setTooltipText("")
  }, [])

  const handleStateClick = useCallback((geo) => {
    const sigla = getSigla(geo)
    if (sigla === "PI" || geo.properties?.name === "Piauí") {
      setNivel(prev => prev === "brasil" ? "piaui" : "brasil")
    }
  }, [])

  const handleMunClick = useCallback((geo) => {
    const name = geo.properties?.name
    // Teresina: animação de saída → troca de componente após 450ms
    if (name === "Teresina") {
      openTeresinaFromPiaui()
      return
    }
    if (!PARTNER_CITIES.has(name)) return
    const info = PARTNER_CITY_DATA[name]
    if (!info) return
    // Toggle: clique na mesma fecha; clique em outra abre
    setCidadeSelecionada(prev => prev?.name === name ? null : { name, ...info })
  }, [openTeresinaFromPiaui])

  const handleMouseMove = useCallback((e) => {
    if (!tooltipText) return
    const now = performance.now()
    if (now - lastMoveTimeRef.current < 16) return
    lastMoveTimeRef.current = now
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [tooltipText])


  // ── Derivados ─────────────────────────────────────────────────────────────
  const focusPI = nivel !== "brasil"

  // Nível teresina: delegado ao componente Mapbox
  if (nivel === "teresina") {
    return <TeresinaMap onBack={() => setNivel("piaui")} onOrgaoSelect={onOrgaoSelect} />
  }

  return (
    <section
      className={[
        "holo-secao",
        focusPI  ? "holo-secao--zoomed"  : "",
        exiting  ? "holo-secao--exiting" : "",
      ].filter(Boolean).join(" ")}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      role="region"
      aria-label="Mapa interativo de atuação da ETIPI"
    >
      {/* ── Decorações de fundo ────────────────────────────────────────── */}
      <div className={`holo-bg-grid${focusPI ? " holo-bg-grid--paused" : ""}`} aria-hidden="true" />
      {/* Scan line: removida no modo zoom (distraição visual) */}
      {!focusPI && <div className="holo-scan-line" aria-hidden="true" />}
      <div className="holo-corners holo-corner--tl" aria-hidden="true" />
      <div className="holo-corners holo-corner--tr" aria-hidden="true" />
      <div className="holo-corners holo-corner--bl" aria-hidden="true" />
      <div className="holo-corners holo-corner--br" aria-hidden="true" />

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <header className="holo-header">
        <p className="holo-header__eyebrow">SISTEMA / PRESENÇA GEOGRÁFICA</p>
        <h2 className="holo-header__title">
          MAPA DE <span>ATUAÇÃO</span>
        </h2>
        <p className="holo-header__sub">
          {nivel === "piaui"
            ? <span>{isTouchDevice ? "Toque" : "Clique"} em <strong>Teresina</strong> para abrir o mapa da cidade</span>
            : <span>{isTouchDevice ? "Toque" : "Clique"} em <strong>Piauí</strong> para explorar os municípios</span>
          }
        </p>
      </header>

      {/* ── Wrapper do mapa ───────────────────────────────────────────────── */}
      <div
        ref={glitchRef}
        className={[
          "holo-map-wrapper",
          focusPI ? "holo-map-wrapper--zoomed" : "",
        ].filter(Boolean).join(" ")}
      >
        {/* Brilho radial atrás do mapa */}
        <div className="holo-map-glow" aria-hidden="true" />

        <ComposableMap
          className="holo-map-svg"
          projection="geoMercator"
          projectionConfig={{ scale: 800, center: DEFAULT_CENTER }}
          width={800}
          height={490}
        >
          <ZoomableGroup
            center={mapView.center}
            zoom={mapView.zoom}
            minZoom={1}
            maxZoom={20}
            translateExtent={[[-200, -200], [1000, 700]]}
          >
            {/* ── Estados do Brasil ─────────────────────────────────────── */}
            <Geographies geography={BRAZIL_STATES_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const sigla     = getSigla(geo)
                  const isPartner = !focusPI && PARTNER_STATES.has(sigla)
                  const isHovered = !!hoveredState && (hoveredState === sigla || hoveredState === geo.id)
                  return (
                    <GeoState
                      key={geo.rsmKey}
                      geo={geo}
                      isHovered={isHovered}
                      nivel={nivel}
                      isPartner={isPartner}
                      onEnter={(e) => handleStateEnter(e, geo)}
                      onLeave={handleStateLeave}
                      onClick={() => handleStateClick(geo)}
                    />
                  )
                })
              }
            </Geographies>

            {/* ── Elevação holográfica: glow overlay em estados parceiros ── */}
            {!focusPI && (
              <Geographies geography={BRAZIL_STATES_URL}>
                {({ geographies }) => (
                  <g className="holo-elevation-layer" aria-hidden="true">
                    {geographies
                      .filter(geo => PARTNER_STATES.has(getSigla(geo)))
                      .map(geo => (
                        <Geography
                          key={`elev-${geo.rsmKey}`}
                          geography={geo}
                          style={STATE_STYLE_ELEVATION}
                          tabIndex={-1}
                        />
                      ))
                    }
                  </g>
                )}
              </Geographies>
            )}

            {/* ── Municípios do Piauí (local) ───────────────────────────── */}
            {focusPI && piauiGeoJSON && (
              <Geographies geography={piauiGeoJSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name       = geo.properties?.name
                    const isPartner  = PARTNER_CITIES.has(name)
                    const isSelected = cidadeSelecionada?.name === name
                    return (
                      <Geography
                        key={geo.rsmKey || geo.properties?.id}
                        geography={geo}
                        className={isPartner ? "holo-mun-parceiro" : undefined}
                        style={
                          isSelected ? MUN_PARTNER_SELECTED_STYLE
                          : isPartner ? MUN_PARTNER_STYLE
                          : MUN_STYLE
                        }
                        role={isPartner ? "button" : undefined}
                        tabIndex={isPartner ? 0 : -1}
                        aria-label={isPartner ? `Município ${name}` : undefined}
                        aria-pressed={isPartner ? isSelected : undefined}
                        onClick={isPartner ? () => handleMunClick(geo) : undefined}
                        onKeyDown={isPartner ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleMunClick(geo)
                          }
                        } : undefined}
                      />
                    )
                  })
                }
              </Geographies>
            )}

            {/* ── Pins nacionais: visíveis apenas na visão geral do Brasil ─ */}
            {!focusPI && NATIONAL_PINS.map(p => (
              <PinNacional key={p.id} coords={p.coords} tipo={p.tipo} nome={p.nome} raio={p.raio} labelOffsetY={p.labelOffsetY} />
            ))}

            {/* ── Pin da sede: ponteiro SVG (visual via HTML LogoSede) ── */}
            {focusPI && <PinSede coords={SEDE_COORDS} zoom={mapView.zoom} />}

            {/* ── Tracker de posição da sede: comunica coords projetadas para o overlay HTML ── */}
            {focusPI && <SedePositionTracker onPosition={handleSedePosition} />}
          </ZoomableGroup>
        </ComposableMap>

        {/* ── Logo sede: HTML overlay — posição dinâmica calculada pelo SedePositionTracker ── */}
        {focusPI && logoVisivel && <LogoSede onActivate={openTeresinaFromPiaui} pixelPos={sedePixelPos} />}

        {/* ── Info card: cidade parceira selecionada ─────────────────── */}
        <CidadeDash
          cidade={cidadeSelecionada}
          onClose={() => setCidadeSelecionada(null)}
        />

        {/* Overlay de scan sobre o mapa: removido no modo zoom */}
        {!focusPI && <div className="holo-map-scan-overlay" aria-hidden="true" />}
      </div>

      {/* ── Botão de reset ────────────────────────────────────────────────── */}
      {focusPI && (
        <button
          className="holo-btn-reset"
          onClick={() => setNivel(nivel === "teresina" ? "piaui" : "brasil")}
          aria-label={nivel === "teresina" ? "Voltar para o Piauí" : "Voltar para o Brasil"}
        >
          {nivel === "teresina" ? "← PIAUÍ" : "← BRASIL"}
        </button>
      )}

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
      <Tooltip text={tooltipText} x={tooltipPos.x} y={tooltipPos.y} />

      {/* ── Legenda ───────────────────────────────────────────────────────── */}
      <div className="holo-legenda">
        <div className="holo-legenda__item">
          <span className="holo-legenda__dot holo-legenda__dot--sede" />
          Sede — Teresina
        </div>
        <div className="holo-legenda__item">
          <span className="holo-legenda__dot holo-legenda__dot--parceiro" />
          Municípios parceiros
        </div>
        <div className="holo-legenda__item">
          <span className="holo-legenda__dot holo-legenda__dot--piaui" />
          Piauí — ativo
        </div>
      </div>
    </section>
  )
}
