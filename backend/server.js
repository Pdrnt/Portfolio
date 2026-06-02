import "dotenv/config"
import express from "express"
import cors from "cors"
import pool from "./db.js"

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }))
app.use(express.json())

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

    const { id, created_at } = result.rows[0]
    console.log(`[${new Date().toISOString()}] Nova proposta #${id} de ${orgao} <${email}>`)

    return res.status(201).json({ id, created_at, message: "Proposta recebida com sucesso!" })
  } catch (err) {
    console.error("Erro ao salvar proposta:", err)
    return res.status(500).json({ error: "Erro interno. Tente novamente." })
  }
})

// ── GET /api/proposals ─── listagem para uso interno ─────────────
app.get("/api/proposals", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM proposals ORDER BY created_at DESC"
    )
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
