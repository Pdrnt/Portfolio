import { useState } from "react"
import "../tailwind.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

const FIELD_STYLE = {
  width: "100%",
  background: "#0c1a38",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "13px",
  color: "white",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
}

const Field = ({ as: Tag = "input", style, ...props }) => (
  <Tag
    {...props}
    style={{ ...FIELD_STYLE, ...style }}
    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
  />
)

const ChevronDown = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const INITIAL = { nome: "", orgao: "", email: "", telefone: "", vertical: "", mensagem: "" }

export default function ProposalCard() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState("idle") // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("")

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("sending")
    setErrorMsg("")

    try {
      const res = await fetch(`${API_URL}/api/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao enviar. Tente novamente.")
        setStatus("error")
        return
      }

      setStatus("success")
      setForm(INITIAL)
    } catch {
      setErrorMsg("Não foi possível conectar ao servidor.")
      setStatus("error")
    }
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[400px] rounded-2xl overflow-hidden max-[640px]:w-[calc(100%-2rem)] max-[640px]:right-4 max-[640px]:bottom-4"
      style={{
        background: "linear-gradient(160deg,#0f1e42 0%,#0a1328 100%)",
        border: "1px solid rgba(30,60,120,0.7)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(66,165,245,0.08)",
      }}
    >
      {/* ── Header toggle ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px" }}
        className="flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors duration-200"
      >
        <div className="flex items-center gap-3 text-left">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(37,99,235,0.85)", boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h8M2 12h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, fontSize: "14px", lineHeight: 1.3 }}>
              Entre Em Contato
            </div>
            {status === "success" && (
              <div style={{ color: "rgba(147,197,253,0.65)", fontSize: "12px", marginTop: "2px" }}>
                ✓ Enviado com sucesso!
              </div>
            )}
          </div>
        </div>

        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}
        >
          <ChevronDown />
        </div>
      </button>

      {/* ── Form body (animated) ── */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? "700px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div style={{ margin: "0 20px", height: "1px", background: "rgba(255,255,255,0.07)" }} />

        {status === "success" ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
              Proposta recebida!
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: 1.6 }}>
              Nossa equipe entrará em contato em breve.
            </div>
            <button
              onClick={() => setStatus("idle")}
              style={{ marginTop: "20px", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "8px 20px", color: "rgba(255,255,255,0.6)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
            >
              Enviar outra solicitação
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "20px" }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field type="text" placeholder="Nome completo" value={form.nome} onChange={set("nome")} required />
              <Field type="text" placeholder="Órgão / Instituição" value={form.orgao} onChange={set("orgao")} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field type="email" placeholder="E-mail institucional" value={form.email} onChange={set("email")} required />
              <Field type="tel" placeholder="Telefone / WhatsApp" value={form.telefone} onChange={set("telefone")} />
            </div>
            <Field as="select" value={form.vertical} onChange={set("vertical")}>
              <option value="" style={{ background: "#0c1a38" }}>Vertical de interesse</option>
              {["Administração","Saúde","Educação","Segurança Pública e Trânsito","Redes e Serviços de TI","Governo Digital","Vários / Não sei ainda"].map((o) => (
                <option key={o} style={{ background: "#0c1a38" }}>{o}</option>
              ))}
            </Field>
            <Field as="textarea" rows={3} placeholder="Descreva brevemente sua necessidade..." value={form.mensagem} onChange={set("mensagem")} style={{ resize: "none" }} />

            {status === "error" && (
              <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.35)", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
              style={{
                background: status === "sending" ? "#1e3a8a" : "#2563eb",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                cursor: status === "sending" ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
                opacity: status === "sending" ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.background = "#1d4ed8" }}
              onMouseLeave={(e) => { if (status !== "sending") e.currentTarget.style.background = "#2563eb" }}
            >
              {status === "sending" ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M7 2a5 5 0 0 1 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Solicitação
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", textAlign: "center", lineHeight: 1.5 }}>
              Seus dados são tratados com sigilo conforme a LGPD.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
