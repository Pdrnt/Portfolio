import { useEffect, useMemo, useState } from "react"
import "../styles/colmeia.css"

const VERTICALS = [
  { id: "seg", name: "Segurança Pública", color: "#5fb133" },
  { id: "admin", name: "Administração", color: "#e2663c" },
  { id: "ti", name: "Redes e Serviços de TI", color: "#8478ec" },
  { id: "gov", name: "Governo Digital", color: "#1fb488" },
  { id: "saude", name: "Saúde", color: "#3b95e6" },
  { id: "educ", name: "Educação", color: "#e7a93a" },
]

const PRODUCTS = [
  { v: "seg", ic: "id", n: "Identificação e Carteiras / CIN", t: "Super Produto", lede: "Emissão da Carteira de Identidade Nacional com biometria e alta disponibilidade.", d: "Serviço de identificação civil para emissão da Carteira de Identidade Nacional (CIN), com captura de biometria facial e digital, infraestrutura em nuvem nacional e estratégia de Disaster Recovery que garante continuidade do serviço ao cidadão.", f: ["Biometria facial", "Biometria digital", "Nuvem nacional", "Disaster Recovery", "Segurança certificada", "Integração nacional"], c: "Implantação em âmbito nacional, integrando os institutos de identificação ao padrão da CIN." },
  { v: "seg", ic: "phone", n: "Cell Guard", t: "Super Produto", lede: "Rastreamento inteligente de celulares roubados com integração às operadoras.", d: "Plataforma de combate ao roubo de celulares que cruza bases de IMEIs com apoio de inteligência artificial, integra-se às operadoras de telefonia e notifica o cidadão e as forças de segurança por WhatsApp, acelerando o bloqueio e a recuperação dos aparelhos.", f: ["Cruzamento de IMEIs", "IA de padrões", "Integração com operadoras", "Alertas no WhatsApp", "Banco de IMEIs", "Painel para a polícia"], c: "Operação no Piauí, em articulação com a Secretaria de Segurança Pública." },
  { v: "seg", ic: "alert", n: "B.O. Fácil", t: "Super Produto", lede: "Registro de boletins de ocorrência pelo WhatsApp, com dados integrados.", d: "Canal digital que permite registrar boletins de ocorrência diretamente pelo WhatsApp, apoiado por uma arquitetura Data Lakehouse que consolida e integra as informações às bases estaduais e federais de segurança pública, com atendimento por linha 0800.", f: ["Registro via WhatsApp", "Arquitetura Data Lakehouse", "Integração estadual", "Integração federal", "Atendimento 0800", "Análise de dados"], c: "Piauí — canal de atendimento 0800 086 0190." },
  { v: "seg", ic: "scale", n: "IntegraFISP", t: "Produto Estratégico", lede: "Gestão integrada dos fundos da segurança pública.", d: "Sistema de controle do Fundo Nacional de Segurança Pública (FNSP) e do Fundo Estadual de Segurança Pública (FESP), com dashboards gerenciais e acompanhamento de convênios, contratos e licitações, dando transparência e rastreabilidade à aplicação dos recursos.", f: ["Gestão do FNSP", "Gestão do FESP", "Dashboards gerenciais", "Convênios e contratos", "Conformidade fiscal", "Rastreabilidade"], c: "Adotado por órgãos estaduais de segurança pública." },
  { v: "admin", ic: "users", n: "SIAPE", t: "Super Produto", lede: "Plataforma completa de gestão de pessoas para o setor público.", d: "Centraliza o ciclo de vida do servidor — cadastro funcional, folha de pagamento, frequência e carreira — sobre um motor de regras parametrizável, com controle de acesso por perfil (RBAC) e conformidade integral com a LGPD.", f: ["Cadastro funcional", "Folha de pagamento", "Frequência e ponto", "Gestão de carreira", "Controle RBAC", "Conformidade LGPD"], c: "Em uso no Piauí e em Goiás (gestão de pessoas)." },
  { v: "admin", ic: "chart", n: "Consultoria para PDTIC", t: "Produto Estratégico", lede: "Planejamento estratégico e de tecnologia para o órgão público.", d: "Serviço de consultoria para elaboração do Planejamento Estratégico Institucional e do Plano Diretor de Tecnologia da Informação e Comunicação (PDTIC) bianual, com diagnóstico SWOT, definição de KPIs e construção de um roadmap tecnológico alinhado aos objetivos institucionais.", f: ["Diagnóstico SWOT", "PDTIC bianual", "KPIs mensuráveis", "Roadmap de TI", "Governança de TI", "Alinhamento institucional"], c: "Prestado a estados e municípios." },
  { v: "admin", ic: "box", n: "Guardvisio", t: "Produto Estratégico", lede: "Gestão de ativos mobiliários com georreferenciamento.", d: "Solução para gestão do patrimônio mobiliário e de suas manutenções, com georreferenciamento dos ativos e aplicativo com funcionamento offline para inventário em campo, gerando relatórios gerenciais para a tomada de decisão.", f: ["Inventário de ativos", "Agendamento de manutenções", "Georreferenciamento", "Aplicativo offline", "Relatórios gerenciais", "Controle patrimonial"], c: "Aplicado em diversos órgãos públicos." },
  { v: "admin", ic: "file", n: "CREDENCIA", t: "Produto Estratégico", lede: "Credenciamento digital de fornecedores conforme a nova lei de licitações.", d: "Plataforma de credenciamento eletrônico de fornecedores em conformidade com a Lei nº 14.133/2021 e o Decreto Estadual nº 21.872/2023, com integração a sistemas, rastreabilidade dos processos e segurança de dados ponta a ponta.", f: ["Credenciamento eletrônico", "Conformidade legal", "Integração de sistemas", "Rastreabilidade", "Segurança de dados", "Transparência"], c: "Casos como CREDSUS e Credencia PE (Pernambuco)." },
  { v: "admin", ic: "doc", n: "SINCIN", t: "Produto Estratégico", lede: "Controle interno e fiscalização de contratos.", d: "Sistema Integrado de Controle Interno voltado à fiscalização de contratos, disponível em versões web e Android, com dashboards gerenciais, integração fiscal e suporte por helpdesk 24/7.", f: ["Fiscalização de contratos", "Aplicativo Android", "Dashboards gerenciais", "Integração fiscal", "Helpdesk 24/7", "Trilhas de auditoria"], c: "Em operação no Piauí." },
  { v: "admin", ic: "mail", n: "GOV.SPACE", t: "Produto Estratégico", lede: "Suíte de comunicação e colaboração soberana.", d: "Conjunto integrado de gov.mail, gov.drive e gov.meet, oferecendo e-mail corporativo, armazenamento em nuvem e videoconferência com soberania digital, em modelo de cobrança por usuário ativo.", f: ["E-mail corporativo", "Armazenamento em nuvem", "Videoconferência", "Soberania digital", "Cobrança por uso", "Suporte 24/7"], c: "Disponível para órgãos estaduais." },
  { v: "admin", ic: "layers", n: "SIGRP", t: "Produto Estratégico", lede: "Gestão integrada de repasses, convênios e emendas.", d: "Sistema Integrado de Gestão de Repasses que organiza convênios e emendas parlamentares, com integração à LOA/PPA e ao Transferegov, dando controle e conformidade a todo o ciclo do repasse.", f: ["Gestão de convênios", "Emendas parlamentares", "Integração LOA/PPA", "Transferegov", "Prestação de contas", "Conformidade"], c: "Utilizado por governos estaduais." },
  { v: "admin", ic: "cpu", n: "Papiro", t: "Produto Estratégico", lede: "Inteligência artificial aplicada à gestão documental.", d: "Plataforma de IA para documentos, com OCR avançado e indexação semântica que torna acervos pesquisáveis, incluindo o Diário Oficial. Alinhada às diretrizes do CONARQ, à LAI e à LGPD.", f: ["OCR avançado", "Indexação semântica", "Busca inteligente", "Diário Oficial", "Conformidade CONARQ/LAI", "Conformidade LGPD"], c: "Aplicado à administração pública." },
  { v: "admin", ic: "chart", n: "EMIT", t: "Produto Estratégico", lede: "Inteligência tributária para municípios.", d: "Ecossistema Municipal de Inteligência Tributária com motor de cálculo tributário e integração ao Gov.br, à REDESIM e ao padrão ABRASF, ampliando a eficiência e a arrecadação municipal.", f: ["Motor de cálculo tributário", "Integração Gov.br", "REDESIM", "Padrão ABRASF", "Analytics tributária", "Gestão da arrecadação"], c: "Voltado a municípios." },
  { v: "admin", ic: "cash", n: "Extracash", t: "Produto Estratégico", lede: "Programa de cashback e benefícios para servidores.", d: "Programa de benefícios financeiros no modelo de cashback para servidores públicos, com carteira digital e rede de estabelecimentos parceiros, valorizando o servidor e movimentando a economia local.", f: ["Carteira digital", "Rede de parceiros", "Resgate automático", "Benefício ao servidor", "Relatórios", "Adesão simples"], c: "Iniciativa no Piauí." },
  { v: "ti", ic: "server", n: "Colocation", t: "Serviço Transversal", lede: "Hospedagem em Data Center Tier III.", d: "Serviço de hospedagem física de equipamentos em Data Center classificado como Tier III, com energia redundante, refrigeração de precisão, segurança física e operação ininterrupta 24x7.", f: ["Tier III certificado", "Energia redundante", "Refrigeração de precisão", "Segurança física", "Operação 24x7", "Alta disponibilidade"], c: "Hospeda a infraestrutura de diversos órgãos." },
  { v: "ti", ic: "wifi", n: "Conectividade: Infraestrutura", t: "Serviço Transversal", lede: "Cabeamento estruturado, POL e redes wireless.", d: "Projeto e implantação de infraestrutura de rede, incluindo cabeamento estruturado, Passive Optical LAN (POL) e redes wireless de alta performance, com gestão centralizada e suporte 24/7.", f: ["Cabeamento estruturado", "Passive Optical LAN", "Wireless de alto desempenho", "Gestão centralizada", "Suporte 24/7", "Projeto sob medida"], c: "Implantado em órgãos públicos." },
  { v: "ti", ic: "link", n: "Conectividade: Links de Internet", t: "Serviço Transversal", lede: "Links de internet por fibra, satélite e PAP.", d: "Provimento de links de internet por fibra óptica, satélite e Pontos de Acesso Público, com SLA garantido e redundância, por meio da subsidiária PiauíLink, levando conectividade a todo o território.", f: ["Fibra simétrica", "Satélite de contingência", "Ponto de Acesso Público", "SLA garantido", "Redundância de links", "Cobertura ampla"], c: "Conectividade em todo o Piauí (PiauíLink)." },
  { v: "ti", ic: "monitor", n: "HaaS — Hardware as a Service", t: "Serviço Transversal", lede: "Equipamentos como serviço, convertendo CAPEX em OPEX.", d: "Disponibilização de estações de trabalho, impressoras, scanners e servidores como serviço, com manutenção e upgrade incluídos, transformando investimento de capital (CAPEX) em despesa operacional previsível (OPEX).", f: ["Equipamentos atualizados", "Manutenção inclusa", "Upgrade periódico", "Custo previsível", "Suporte técnico", "CAPEX → OPEX"], c: "Adotado por órgãos diversos." },
  { v: "ti", ic: "chart", n: "NOC — Network Operation Center", t: "Serviço Transversal", lede: "Monitoramento de redes 24x7.", d: "Centro de Operações de Rede com monitoramento 24x7, gestão de UTMs, telemetria em tempo real e automação de resposta, garantindo disponibilidade e desempenho da infraestrutura.", f: ["Monitoramento 24x7", "Gestão de UTMs", "Telemetria em tempo real", "Automação de resposta", "Escalabilidade", "Relatórios de SLA"], c: "Opera redes públicas." },
  { v: "ti", ic: "shield", n: "SOC — Security Operations Center", t: "Serviço Transversal", lede: "Centro de operações de segurança cibernética.", d: "Centro de Operações de Segurança com SIEM, EDR e XDR, monitoramento 24/7, resposta a incidentes, threat hunting e conformidade com a LGPD, protegendo ativos críticos do setor público.", f: ["SIEM", "EDR/XDR", "Resposta a incidentes", "Threat hunting", "Conformidade LGPD", "Monitoramento 24/7"], c: "Protege governos estaduais." },
  { v: "ti", ic: "layers", n: "Licenças de Produtividade Digital", t: "Serviço Transversal", lede: "Gestão centralizada de licenças de software.", d: "Provimento e gestão centralizada de licenças como Microsoft 365, Google Workspace, ClickUp, Canva Pro e Kaspersky, com SSO integrado, suporte técnico e conformidade.", f: ["Múltiplas plataformas", "Gestão de licenças", "SSO integrado", "Suporte técnico", "Conformidade", "Otimização de custos"], c: "Disponível para órgãos públicos." },
  { v: "ti", ic: "cloud", n: "Computação em Nuvem", t: "Serviço Transversal", lede: "Nuvem híbrida com otimização de custos.", d: "Modelo híbrido que combina infraestrutura on-premise com AWS, Google Cloud e Oracle Cloud, com auto-scaling, backup automático, compliance regulatório e otimização contínua de custos.", f: ["Multi-cloud", "Modelo híbrido", "Auto-scaling", "Backup automático", "Compliance", "Otimização de custos"], c: "Adotado por empresas públicas." },
  { v: "ti", ic: "file", n: "S.E.I — Implantação e Suporte", t: "Produto Estratégico", lede: "Sistema Eletrônico de Informações implantado e suportado.", d: "Serviço de implantação e suporte do Sistema Eletrônico de Informações (SEI), em versões web e mobile, com gestão documental, workflows customizáveis e conformidade com a LGPD.", f: ["Gestão documental", "Workflows customizáveis", "Aplicativo mobile", "Conformidade LGPD", "Integração institucional", "Suporte especializado"], c: "Implantado em órgãos federais." },
  { v: "ti", ic: "code", n: "Fábrica de Software", t: "Serviço Transversal", lede: "Desenvolvimento ágil de soluções públicas.", d: "Desenvolvimento e manutenção de sistemas com metodologias ágeis, integração contínua (CI/CD), cultura DevOps e soberania digital, entregando software sob medida com documentação completa.", f: ["Scrum e Kanban", "CI/CD", "Code review", "Cultura DevOps", "Documentação completa", "Soberania digital"], c: "Atua em diversos projetos." },
  { v: "ti", ic: "scale", n: "Adequação para LGPD", t: "Produto Estratégico", lede: "Conformidade ponta a ponta com a LGPD.", d: "Consultoria de adequação à Lei Geral de Proteção de Dados, com mapeamento de fluxos de dados, designação de DPO e ferramentas como LGPDNow, BigID, ServiceNow, Pentera e Thales.", f: ["Mapeamento de fluxos", "Designação de DPO", "Plataforma LGPDNow", "Descoberta com BigID", "Pentest (Pentera)", "Criptografia (Thales)"], c: "Aplicado a órgãos de governo." },
  { v: "ti", ic: "lock", n: "Solução em Cybersegurança", t: "Serviço Transversal", lede: "Proteção integrada e resposta a incidentes.", d: "Solução de cibersegurança com NGFW, EDR/XDR, DLP e WAF, definição de RTO/RPO e plano de resposta a incidentes, com equipamentos fornecidos em comodato.", f: ["NGFW", "EDR/XDR", "DLP e WAF", "RTO/RPO definidos", "Plano de resposta", "Equipamentos em comodato"], c: "Protege órgãos críticos." },
  { v: "ti", ic: "cert", n: "Certificado Digital", t: "Serviço Transversal", lede: "Identidade digital com validade jurídica.", d: "Autoridade de Registro vinculada à ICP-Brasil para emissão de e-CPF e e-CNPJ e assinatura eletrônica com validade jurídica, incluindo assinatura remota e validação 24/7.", f: ["ICP-Brasil", "e-CPF", "e-CNPJ", "Assinatura remota", "Validade jurídica", "Validação 24/7"], c: "Emissão em âmbito nacional." },
  { v: "gov", ic: "globe", n: "Gov.Pi", t: "Super Produto", lede: "O ecossistema digital do governo, em um só lugar.", d: "Plataforma que integra cerca de 300 soluções digitais com login único e integração ao Gov.br, em versões web e mobile, organizada em áreas para o cidadão, o servidor e as empresas — o ponto único de acesso ao governo digital.", f: ["~300 soluções integradas", "Login único", "Integração Gov.br", "Versões web e mobile", "Área do cidadão", "Área do servidor e empresas"], c: "Em operação no Piauí." },
  { v: "saude", ic: "pulse", n: "Telessaúde Digital", t: "Super Produto", lede: "Telemedicina 24h com apoio de inteligência artificial.", d: "Plataforma de telemedicina que oferece teleconsultas 24h e telediagnósticos com apoio de IA, mantendo histórico clínico integrado e conformidade com a LGPD, ampliando o acesso à saúde mesmo em regiões remotas.", f: ["Teleconsultas 24h", "Telediagnósticos", "Apoio de IA", "Histórico integrado", "Segurança LGPD", "Acesso remoto"], c: "Casos no Pará (IASEP) e no Amazonas." },
  { v: "saude", ic: "doc", n: "Prontuário Eletrônico", t: "Produto Estratégico", lede: "Registro clínico integrado ao SUS.", d: "Prontuário eletrônico integrado ao e-SUS e ao Conecte SUS, com agendamento de consultas e gestão de filas, unificando o histórico do paciente na rede pública.", f: ["Integração e-SUS", "Conecte SUS", "Agendamento online", "Gestão de filas", "Histórico unificado", "Relatórios clínicos"], c: "Utilizado na rede pública de saúde." },
  { v: "saude", ic: "health", n: "Paciente Integrado", t: "Produto Estratégico", lede: "Gestão assistencial e administrativa hospitalar.", d: "Solução de gestão assistencial e administrativa que abrange gestão de leitos, mapa cirúrgico e controle de OPMEs, com faturamento e indicadores de qualidade para a unidade de saúde.", f: ["Gestão de leitos", "Mapa cirúrgico", "Controle de OPME", "Faturamento", "Indicadores de qualidade", "Visão integrada"], c: "Aplicado em hospitais públicos." },
  { v: "saude", ic: "brain", n: "IA para Prontuários", t: "Produto Estratégico", lede: "Leitura e estruturação inteligente de dados clínicos.", d: "Camada de inteligência artificial que lê, estrutura e interpreta dados clínicos integrados ao prontuário eletrônico, gerando sugestões diagnósticas, alertas automáticos e análises preditivas.", f: ["NLP clínico", "Extração de dados", "Sugestões diagnósticas", "Alertas automáticos", "Análise preditiva", "Integração ao prontuário"], c: "Voltado a unidades de saúde." },
  { v: "saude", ic: "monitor", n: "Gestor Saúde", t: "Produto Estratégico", lede: "Plataforma integrada de gestão da assistência.", d: "Plataforma em arquitetura de microsserviços para gestão da assistência, com IA para regulação automática e carteirinha digital, integrando a rede de atenção em escala regional.", f: ["Regulação automática", "Carteirinha digital", "Microsserviços", "Integração regional", "Analytics avançada", "Escalabilidade"], c: "Em uso no IASPI Saúde." },
  { v: "saude", ic: "users", n: "Spectrum", t: "Produto Estratégico", lede: "Gestão do cuidado de pessoas neurodivergentes.", d: "Solução SaaS para a gestão do cuidado de pessoas neurodivergentes, com Planos de Atendimento Individualizado (PAIs), teleatendimento e acompanhamento contínuo, apoiando famílias e equipes de saúde.", f: ["PAIs personalizados", "Teleatendimento", "Comunidade de apoio", "Acompanhamento contínuo", "Modelo SaaS", "Relatórios de evolução"], c: "Aplicado em programas de saúde mental." },
  { v: "educ", ic: "baby", n: "Plataforma da Primeira Infância", t: "Super Produto", lede: "Desenvolvimento integral de crianças de 0 a 6 anos.", d: "Plataforma para o desenvolvimento integral na primeira infância, estruturada sobre o framework Nurturing Care (OMS/UNICEF/Banco Mundial) e o Marco Legal da Primeira Infância (Lei nº 13.257/2016), com acompanhamento do desenvolvimento e integração com as famílias.", f: ["Lei nº 13.257/2016", "Framework Nurturing Care", "Acompanhamento do desenvolvimento", "Integração familiar", "Indicadores OMS", "Intersetorialidade"], c: "Implantada em Lagoa do Piauí." },
  { v: "educ", ic: "school", n: "EducaCorp", t: "Produto Estratégico", lede: "Educação corporativa para o setor público.", d: "Plataforma de educação corporativa com Ambiente Virtual de Aprendizagem (AVA), trilhas personalizadas, gamificação e certificados, integrada ao Gov.br, para capacitar servidores em escala.", f: ["AVA completo", "Trilhas personalizadas", "Gamificação", "Certificados", "Integração Gov.br", "Analytics de aprendizado"], c: "Disponível para órgãos públicos." },
  { v: "educ", ic: "book", n: "Ensinus", t: "Produto Estratégico", lede: "Gestão escolar pública com participação das famílias.", d: "Plataforma de gestão escolar pública com notificações para os pais, controle de frequência, boletim digital e dashboards gerenciais, aproximando escola e família.", f: ["Gestão acadêmica", "Notificações aos pais", "Frequência online", "Boletim digital", "Dashboards gerenciais", "Comunicação integrada"], c: "Em uso na SEMED de Timon-MA." },
  { v: "educ", ic: "monitor", n: "Plataforma de Mediação Tecnológica", t: "Produto Estratégico", lede: "Educação mediada por tecnologia em larga escala.", d: "Plataforma capaz de suportar mais de 500.000 usuários simultâneos, com IA adaptativa, gestão socioemocional e acessibilidade, alinhada à BNCC, para a educação mediada por tecnologia.", f: ["Mais de 500 mil usuários", "IA adaptativa", "Gestão socioemocional", "Alinhamento à BNCC", "Acessibilidade", "Alta escalabilidade"], c: "Voltada a redes estaduais de educação." },
]

const COLDEF = [
  { v: "seg", h: 4 },
  { v: "admin", h: 5 }, { v: "admin", h: 5 },
  { v: "ti", h: 5 }, { v: "ti", h: 5 }, { v: "ti", h: 3 },
  { v: "gov", h: 1 },
  { v: "saude", h: 3 }, { v: "saude", h: 3 },
  { v: "educ", h: 4 },
]

const TYPES = ["Super Produto", "Produto Estratégico", "Serviço Transversal"]
const SHORT_V = { "Redes e Serviços de TI": "Redes e TI", "Segurança Pública": "Segurança", "Governo Digital": "Gov. Digital" }
const vMap = Object.fromEntries(VERTICALS.map((v) => [v.id, v]))
const PRODUCT_IMAGES = {
  "Identificação e Carteiras / CIN": "Serviço de Identificação e Carteiras.png",
  "Cell Guard": "Cell Guard.png",
  "B.O. Fácil": "B.O Fácil.png",
  "IntegraFISP": "IntegraFISP.png",
  "SIAPE": "siape.png",
  "Consultoria para PDTIC": "pdtic.png",
  "Guardvisio": "Guardvisio.png",
  "CREDENCIA": "CREDENCIA.png",
  "SINCIN": "SINCIN.png",
  "GOV.SPACE": "GOVSPACE.png",
  "SIGRP": "SIGRP.png",
  "Papiro": "Papiro.png",
  "EMIT": "EMIT.png",
  "Extracash": "Extracash.png",
  "Colocation": "Colocation.png",
  "Conectividade: Infraestrutura": "Conectividade: Infraestrutura.png",
  "Conectividade: Links de Internet": "Conectividade: Links de Internet.png",
  "HaaS — Hardware as a Service": "HaaS.png",
  "NOC — Network Operation Center": "NOC.png",
  "SOC — Security Operations Center": "SOC.png",
  "Licenças de Produtividade Digital": "Licenças de Produtividade Digital.png",
  "Computação em Nuvem": "Computação em Nuvem.png",
  "S.E.I — Implantação e Suporte": "SEI.png",
  "Fábrica de Software": "Fabrica de Software.png",
  "Adequação para LGPD": "Adequação para LGPD.png",
  "Solução em Cybersegurança": "Solução em Cybersegurança.png",
  "Certificado Digital": "Certificado Digital.png",
  "Gov.Pi": "Gov.Pi.png",
  "Telessaúde Digital": "Telessáude.png",
  "Prontuário Eletrônico": "Prontuario.png",
  "Paciente Integrado": "Paciente Integrado.png",
  "IA para Prontuários": "IA para Prontuários.png",
  "Gestor Saúde": "Gestor Saúde.png",
  "Spectrum": "Spectrum.png",
  "Plataforma da Primeira Infância": "Plataforma da Primeira Infância.png",
  "EducaCorp": "EducaCorp.png",
  "Ensinus": "Ensinus.png",
  "Plataforma de Mediação Tecnológica": "Plataforma de Mediação Tecnológic.png",
}

function hexA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function norm(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function getProductImage(product) {
  const fileName = PRODUCT_IMAGES[product.n]
  return fileName ? `images/${fileName}` : null
}

function Icon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
  const shapes = {
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 5.6M17.5 19a5 5 0 0 0-3-4.6" /></>,
    chart: <><path d="M4 4v16h16" /><rect x="7" y="11" width="3" height="6" /><rect x="12" y="7" width="3" height="10" /><rect x="17" y="13" width="3" height="4" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
    phone: <><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></>,
    alert: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" /></>,
    server: <><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><path d="M8 7h.01M8 17h.01" /></>,
    cloud: <path d="M7 18a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 18z" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
    code: <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />,
    monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20h6M12 16v4" /></>,
  }
  return <svg viewBox="0 0 24 24" {...common}>{shapes[name] || shapes.monitor || <circle cx="12" cy="12" r="8" />}</svg>
}

function Scene({ color }) {
  return (
    <svg viewBox="0 0 380 285" aria-hidden="true">
      <rect x="28" y="54" width="324" height="190" rx="18" fill="#eef2f8" opacity=".95" />
      <rect x="48" y="78" width="86" height="58" rx="12" fill={hexA(color, .18)} />
      <rect x="150" y="78" width="86" height="58" rx="12" fill="#dde4ee" />
      <rect x="252" y="78" width="70" height="58" rx="12" fill={hexA(color, .28)} />
      <rect x="58" y="168" width="24" height="54" rx="5" fill={hexA(color, .45)} />
      <rect x="100" y="146" width="24" height="76" rx="5" fill={color} />
      <rect x="142" y="184" width="24" height="38" rx="5" fill={hexA(color, .45)} />
      <path d="M205 212c24-70 68-96 118-124" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <circle cx="300" cy="114" r="34" fill="none" stroke="#c4cfde" strokeWidth="14" />
      <circle cx="300" cy="114" r="34" fill="none" stroke={color} strokeWidth="14" strokeDasharray="134 220" strokeLinecap="round" transform="rotate(-90 300 114)" />
    </svg>
  )
}

function buildComb() {
  const W = 104
  const H = Math.round(W * 0.866)
  const colStep = Math.round(0.75 * W)
  const slotStep = Math.round(H / 2)
  const centerSlot = 16
  const queues = Object.fromEntries(VERTICALS.map((v) => [v.id, PRODUCTS.filter((p) => p.v === v.id)]))
  const cells = []

  COLDEF.forEach((cd, c) => {
    const n = cd.h
    let start = centerSlot - (n - 1)
    if ((((start % 2) + 2) % 2) !== (c % 2)) start += 1
    for (let i = 0; i < n; i += 1) cells.push({ c, slot: start + 2 * i, prod: queues[cd.v].shift() })
  })

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  cells.forEach((ce) => {
    ce.cx = ce.c * colStep + W / 2
    ce.cy = ce.slot * slotStep + H / 2
    minX = Math.min(minX, ce.cx - W / 2)
    maxX = Math.max(maxX, ce.cx + W / 2)
    minY = Math.min(minY, ce.cy - H / 2)
    maxY = Math.max(maxY, ce.cy + H / 2)
  })

  const padX = 46
  const padTop = 86
  const padBot = 86
  cells.forEach((ce) => {
    ce.x = ce.cx - minX + padX
    ce.y = ce.cy - minY + padTop
  })

  const width = maxX - minX + padX * 2
  const height = maxY - minY + padTop + padBot
  const clusters = Object.fromEntries(VERTICALS.map((v) => [v.id, { cells: [], minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity }]))

  cells.forEach((ce) => {
    const cl = clusters[ce.prod.v]
    cl.cells.push(ce)
    cl.minx = Math.min(cl.minx, ce.x)
    cl.maxx = Math.max(cl.maxx, ce.x)
    cl.miny = Math.min(cl.miny, ce.y)
    cl.maxy = Math.max(cl.maxy, ce.y)
  })

  const labels = VERTICALS
    .map((v) => ({ v, cx: (clusters[v.id].minx + clusters[v.id].maxx) / 2 }))
    .sort((a, b) => a.cx - b.cx)
    .map(({ v }, i) => {
      const cl = clusters[v.id]
      const top = i % 2 === 0
      const anchor = cl.cells.reduce((best, ce) => (top ? ce.y < best.y : ce.y > best.y) ? ce : best, cl.cells[0])
      const labY = top ? 6 : height - 30
      const lineTop = top ? labY + 26 : anchor.y + H / 2
      const lineHeight = top ? Math.max(0, anchor.y - H / 2 - (labY + 26)) : Math.max(0, labY - (anchor.y + H / 2))
      return { v, top, x: Math.max(86, Math.min(width - 86, anchor.x)), y: labY, lineX: anchor.x, lineTop, lineHeight }
    })

  const halos = VERTICALS.map((v) => {
    const cl = clusters[v.id]
    const w = cl.maxx - cl.minx + W * 1.5
    const h = cl.maxy - cl.miny + H * 1.4
    return { v, x: (cl.minx + cl.maxx) / 2 - w / 2, y: (cl.miny + cl.maxy) / 2 - h / 2, w, h }
  })

  return { W, H, width, height, cells, labels, halos }
}

export default function ColmeiaView() {
  const [q, setQ] = useState("")
  const [fVert, setFVert] = useState("all")
  const [fType, setFType] = useState("all")
  const [detail, setDetail] = useState(null)
  const comb = useMemo(buildComb, [])

  const shown = useMemo(() => PRODUCTS.filter((p) => {
    if (fVert !== "all" && p.v !== fVert) return false
    if (fType !== "all" && p.t !== fType) return false
    if (!q.trim()) return true
    return norm(`${p.n} ${p.lede} ${p.d} ${p.f.join(" ")}`).includes(norm(q.trim()))
  }), [fType, fVert, q])

  const shownNames = useMemo(() => new Set(shown.map((p) => p.n)), [shown])
  const active = fVert !== "all" || fType !== "all" || q.trim()

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDetail(null) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = detail ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [detail])

  const openContact = (name) => {
    window.location.href = `mailto:din@etipi.pi.gov.br?subject=${encodeURIComponent(`Interesse no produto: ${name}`)}`
  }

  return (
    <div className="honey">
      <div className="honey-bg" />
      <header className="honey-head">
        <div className="honey-brand">
          <span className="honey-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 20L20 4M20 4H9M20 4V15" stroke="#22cfe8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <div><div className="honey-name">ET<b>i</b>PI</div><div className="honey-sub">Empresa de Tecnologia da Informação do Piauí</div></div>
        </div>
        <div className="honey-tag"><div>Facilitar <i>vidas</i> e transformar o <i>futuro</i></div><span>Esse é o nosso propósito</span></div>
      </header>

      <div className="honey-hero">
        <h3>Uma colmeia de soluções <i>para o setor público</i></h3>
        <p>Cada favo é um produto ou serviço da ETIPI. Explore pela colmeia ou use a busca e os filtros ao lado para ir direto ao produto.</p>
      </div>

      <div className="honey-layout">
        <aside className="honey-sidebar">
          <div className="honey-side-h">Encontrar um produto</div>
          <div className={`honey-search${q ? " has" : ""}`}>
            <svg className="honey-si" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Buscar por nome ou palavra-chave..." />
            <button className="honey-clr" title="Limpar" onClick={() => setQ("")}>×</button>
          </div>
          <div className="honey-filt-label">Vertical</div>
          <div className="honey-chips">
            <button className={`honey-fchip${fVert === "all" ? " on" : ""}`} onClick={() => setFVert("all")}>Todas</button>
            {VERTICALS.map((v) => (
              <button key={v.id} className={`honey-fchip${fVert === v.id ? " on" : ""}`} onClick={() => setFVert(v.id)}>
                <span style={{ background: v.color }} />{SHORT_V[v.name] || v.name}
              </button>
            ))}
          </div>
          <div className="honey-filt-label">Tipo</div>
          <div className="honey-chips">
            <button className={`honey-fchip${fType === "all" ? " on" : ""}`} onClick={() => setFType("all")}>Todos</button>
            {TYPES.map((t) => <button key={t} className={`honey-fchip${fType === t ? " on" : ""}`} onClick={() => setFType(t)}>{t.replace("Produto ", "").replace("Serviço ", "")}</button>)}
          </div>
          <div className="honey-count">{shown.length} de {PRODUCTS.length} produtos</div>
          <div className="honey-prod-list">
            {shown.length ? shown.map((p) => {
              const v = vMap[p.v]
              return (
                <button key={p.n} className="honey-pli" onClick={() => setDetail(p)}>
                  <span className="honey-pic" style={{ background: hexA(v.color, .16), color: v.color }}><Icon name={p.ic} /></span>
                  <span><strong>{p.n}</strong><small>{SHORT_V[v.name] || v.name} · {p.t}</small></span>
                </button>
              )
            }) : <div className="honey-no-res">Nenhum produto encontrado.</div>}
          </div>
        </aside>

        <div className="honey-comb-scroll">
          <div className="honey-comb" style={{ width: comb.width, height: comb.height }}>
            {comb.halos.map(({ v, x, y, w, h }) => <div key={v.id} className="honey-halo" style={{ left: x, top: y, width: w, height: h, background: `radial-gradient(closest-side, ${hexA(v.color, .85)}, ${hexA(v.color, .4)} 62%, transparent)` }} />)}
            {comb.labels.map(({ v, x, y, lineX, lineTop, lineHeight }) => (
              <div key={v.id}>
                <div className="honey-clabel" style={{ left: x, top: y }}><span><i style={{ background: v.color }} />{v.name}</span></div>
                <div className="honey-cline" style={{ left: lineX, top: lineTop, height: lineHeight, background: hexA(v.color, .6) }} />
              </div>
            ))}
            {comb.cells.map((ce) => {
              const p = ce.prod
              const v = vMap[p.v]
              const isCenter = p.v === "gov"
              const dim = active && !shownNames.has(p.n)
              return (
                <button key={p.n} className={`honey-hex${isCenter ? " center" : ""}${dim ? " dim" : ""}`} style={{ left: ce.x - comb.W / 2, top: ce.y - comb.H / 2, width: comb.W, height: comb.H }} onClick={() => setDetail(p)}>
                  <span className="honey-shape" style={{ boxShadow: `inset 0 0 0 2px ${hexA(v.color, isCenter ? 0 : .55)}` }}>
                    <span className="honey-ic" style={{ color: isCenter ? "#06283a" : v.color }}><Icon name={p.ic} /></span>
                  </span>
                  <span className="honey-tip">{p.n}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {detail && <Detail product={detail} onClose={() => setDetail(null)} onOpen={setDetail} onContact={openContact} />}
    </div>
  )
}

function Detail({ product, onClose, onOpen, onContact }) {
  const v = vMap[product.v]
  const related = PRODUCTS.filter((p) => p.v === product.v && p.n !== product.n).slice(0, 4)
  const productImage = getProductImage(product)

  return (
    <div className="honey-detail open">
      <div className="honey-dwrap">
        <button className="honey-back" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          Voltar à colmeia
        </button>
        <div className="honey-phero">
          <div>
            <div className="honey-vtag"><span style={{ background: v.color }} />{v.name}</div>
            <h3>{product.n}</h3>
            <div className="honey-headline">{product.lede.replace(/\.$/, "")}</div>
            <p className="honey-intro">{product.d}</p>
            <span className="honey-pbadge" style={{ background: v.color }}>{product.t}</span>
          </div>
          <div className="honey-scene" style={{ background: hexA(v.color, .1), borderColor: hexA(v.color, .28) }}>
            <div className="honey-sc-glow" style={{ background: `radial-gradient(120% 90% at 80% 10%, ${hexA(v.color, .32)}, transparent 60%)` }} />
            {productImage ? <img src={productImage} alt={product.n} /> : <Scene color={v.color} />}
          </div>
        </div>
        <div className="honey-vp"><span style={{ background: v.color }} /><h4 style={{ color: v.color }}>Proposta de valor</h4><p>{product.d}</p></div>
        <h4 className="honey-sec-h">Principais recursos</h4>
        <div className="honey-recur">{product.f.map((f) => <div key={f} className="honey-ri"><span style={{ background: hexA(v.color, .16), color: v.color }}><Icon name={product.ic} /></span><strong>{f}</strong></div>)}</div>
        <div className="honey-grid2b">
          <div className="honey-card"><h4>Ficha técnica</h4><div className="honey-spec"><span>Vertical</span><strong>{v.name}</strong></div><div className="honey-spec"><span>Classificação</span><strong>{product.t}</strong></div><div className="honey-spec"><span>Contratação</span><strong>Lei 14.133/2021 · Art. 75, IX</strong></div></div>
          <div className="honey-card"><h4>Casos de sucesso</h4><p>{product.c}</p></div>
        </div>
        <div className="honey-cta"><button className="honey-btn primary" style={{ background: v.color }} onClick={() => onContact(product.n)}>Solicitar informações</button><button className="honey-btn ghost" onClick={() => onContact(product.n)}>Falar com a ETIPI</button></div>
        {!!related.length && <div className="honey-related"><h4>Outros produtos de {v.name}</h4><div>{related.map((r) => <button key={r.n} onClick={() => onOpen(r)}><span style={{ color: v.color }}><Icon name={r.ic} /></span>{r.n}</button>)}</div></div>}
      </div>
    </div>
  )
}
