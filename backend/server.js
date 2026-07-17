import "dotenv/config"
import express from "express"
import cors from "cors"
import nodemailer from "nodemailer"
import pool from "./db.js"

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }))
app.use(express.json())

// ── Mailer ───────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function notifyNewProposal({ id, nome, orgao, email, telefone, vertical, mensagem, created_at }) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_EMAIL) return

  const formatted = new Date(created_at).toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })

  await transporter.sendMail({
    from: `"ETIPI Portfolio" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    subject: `[ETIPI] Nova solicitação de proposta #${id} — ${orgao}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:#0f1e42;padding:20px 24px">
          <span style="color:white;font-size:18px;font-weight:700">ETIPI — Nova Proposta #${id}</span>
        </div>
        <div style="padding:24px;color:#1e293b;line-height:1.7">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b;width:130px">Nome</td><td style="padding:6px 0;font-weight:600">${nome}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Órgão</td><td style="padding:6px 0;font-weight:600">${orgao}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">E-mail</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Telefone</td><td style="padding:6px 0">${telefone || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Vertical</td><td style="padding:6px 0">${vertical || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Recebido em</td><td style="padding:6px 0">${formatted}</td></tr>
          </table>
          ${mensagem ? `<div style="margin-top:16px;padding:14px;background:#f8fafc;border-radius:6px;border-left:3px solid #2563eb"><strong>Mensagem:</strong><br/>${mensagem}</div>` : ""}
        </div>
      </div>
    `,
  })
}

// ── POST /api/proposals ──────────────────────────────────────────
app.post("/api/proposals", async (req, res) => {
  const { nome, orgao, email, telefone, vertical, mensagem } = req.body

  if (!nome?.trim() || !orgao?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Nome, órgão e e-mail são obrigatórios." })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." })
  }

  try {
    const result = await pool.query(
      `INSERT INTO proposals (nome, orgao, email, telefone, vertical, mensagem)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [nome.trim(), orgao.trim(), email.trim(), telefone?.trim() || null, vertical?.trim() || null, mensagem?.trim() || null]
    )

    const row = result.rows[0]
    console.log(`[${new Date().toISOString()}] Nova proposta #${row.id} de ${orgao} <${email}>`)

    // Envio de e-mail em background — não bloqueia a resposta
    notifyNewProposal({ ...row, nome, orgao, email, telefone, vertical, mensagem }).catch((err) =>
      console.error("Erro ao enviar e-mail de notificação:", err.message)
    )

    return res.status(201).json({ id: row.id, created_at: row.created_at, message: "Proposta recebida com sucesso!" })
  } catch (err) {
    console.error("Erro ao salvar proposta:", err)
    return res.status(500).json({ error: "Erro interno. Tente novamente." })
  }
})

// ── GET /api/proposals ─── listagem para uso interno ─────────────
app.get("/api/proposals", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM proposals ORDER BY created_at DESC")
    return res.json(result.rows)
  } catch (err) {
    console.error("Erro ao listar propostas:", err)
    return res.status(500).json({ error: "Erro interno." })
  }
})

// ── Health check ─────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
