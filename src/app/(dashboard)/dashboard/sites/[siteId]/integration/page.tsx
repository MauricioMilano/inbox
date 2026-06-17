'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Code, Bot, Globe } from 'lucide-react'

interface Site {
  id: string
  name: string
  domain: string
  token: string
}

export default function SiteIntegrationPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'html' | 'ai'>('html')
  const [activeHtmlTab, setActiveHtmlTab] = useState<'form' | 'js'>('form')

  useEffect(() => {
    loadSite()
  }, [siteId])

  async function loadSite() {
    try {
      const res = await fetch(`/api/sites/${siteId}`)
      if (res.ok) {
        const data = await res.json()
        setSite(data.site)
      }
    } catch (error) {
      console.error('Failed to load site:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Site não encontrado</h2>
        <Link href="/dashboard" className="btn btn-primary">Voltar</Link>
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  // Snippets for different platforms - defined after hooks
  const snippets = {
    html: `<!-- HTML Form - Cola isso no site do cliente -->
<form action="${baseUrl}/api/v1/submit" method="POST">
  <input type="hidden" name="_token" value="${site.token}">

  <label>Nome</label>
  <input type="text" name="name" required>

  <label>Email</label>
  <input type="email" name="email" required>

  <label>Telefone</label>
  <input type="tel" name="phone">

  <label>Mensagem</label>
  <textarea name="message" required></textarea>

  <!-- Honeypot anti-spam (não remover) -->
  <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">

  <button type="submit">Enviar</button>
</form>`,

    htmlJs: `<!-- HTML + JavaScript (sem recarregar página) -->
<form id="contact-form">
  <input type="hidden" name="_token" value="${site.token}">

  <label>Nome</label>
  <input type="text" name="name" required>

  <label>Email</label>
  <input type="email" name="email" required>

  <label>Telefone</label>
  <input type="tel" name="phone">

  <label>Mensagem</label>
  <textarea name="message" required></textarea>

  <!-- Honeypot anti-spam (não remover) -->
  <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">

  <button type="submit">Enviar</button>
  <p id="form-status"></p>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById('form-status');
  status.textContent = 'Enviando...';

  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch('${baseUrl}/api/v1/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Site-Token': '${site.token}'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.ok) {
      status.textContent = '✓ Mensagem enviada com sucesso!';
      form.reset();
    } else {
      status.textContent = '✗ Erro: ' + result.message;
    }
  } catch (err) {
    status.textContent = '✗ Erro de conexão. Tente novamente.';
  }
});
</script>`,

    curl: `# Enviar mensagem via curl
curl -X POST ${baseUrl}/api/v1/submit \\
  -H "Content-Type: application/json" \\
  -H "X-Site-Token: ${site.token}" \\
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "+55 11 99999-9999",
    "subject": "Quero um orçamento",
    "message": "Olá, gostaria de saber mais sobre..."
  }'`,

    fetch: `// Enviar mensagem via JavaScript/Fetch
const response = await fetch('${baseUrl}/api/v1/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Site-Token': '${site.token}'
  },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '+55 11 99999-9999',
    subject: 'Quero um orçamento',
    message: 'Olá, gostaria de saber mais sobre...'
  })
});

const result = await response.json();
console.log(result);
// { ok: true, id: "msg_xxx", received_at: "2024-..." }`,

    python: `import requests

response = requests.post(
    '${baseUrl}/api/v1/submit',
    headers={
        'Content-Type': 'application/json',
        'X-Site-Token': '${site.token}'
    },
    json={
        'name': 'João Silva',
        'email': 'joao@email.com',
        'phone': '+55 11 99999-9999',
        'subject': 'Quero um orçamento',
        'message': 'Olá, gostaria de saber mais sobre...'
    }
)

result = response.json()
print(result)
# {'ok': True, 'id': 'msg_xxx', 'received_at': '2024-...'}`,

    nodejs: `// Node.js / TypeScript
const response = await fetch('${baseUrl}/api/v1/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Site-Token': '${site.token}'
  },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '+55 11 99999-9999',
    subject: 'Quero um orçamento',
    message: 'Olá, gostaria de saber mais sobre...'
  })
});

const result = await response.json();
console.log(result);
// { ok: true, id: "msg_xxx", received_at: "2024-..." }`,

    php: `<?php
$response = curl_init('${baseUrl}/api/v1/submit');

curl_setopt_array($response, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'name' => 'João Silva',
        'email' => 'joao@email.com',
        'phone' => '+55 11 99999-9999',
        'subject' => 'Quero um orçamento',
        'message' => 'Olá, gostaria de saber mais sobre...'
    ]),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-Site-Token: ${site.token}'
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$result = json_decode(curl_exec($response), true);
print_r($result);
// ['ok' => true, 'id' => 'msg_xxx', 'received_at' => '2024-...']
?>`,

    go: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    payload := map[string]string{
        "name":    "João Silva",
        "email":   "joao@email.com",
        "phone":   "+55 11 99999-9999",
        "subject": "Quero um orçamento",
        "message": "Olá, gostaria de saber mais sobre...",
    }

    jsonData, _ := json.Marshal(payload)

    req, _ := http.NewRequest(
        "POST",
        "${baseUrl}/api/v1/submit",
        bytes.NewBuffer(jsonData),
    )
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-Site-Token", "${site.token}")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()
}`,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="btn btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Integração: {site.name}</h1>
          <p className="text-sm text-slate-500">Instruções para conectar seu site ao Milano Inbox</p>
        </div>
      </div>

      {/* Token Info */}
      <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold mb-1">Token do Site</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Use este token para identificar o site nas requisições
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-3 border">
              <code className="flex-1 text-sm break-all font-mono">{site.token}</code>
              <button
                onClick={() => copyToClipboard(site.token, 'token')}
                className="btn btn-primary btn-sm"
              >
                {copied === 'token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === 'token' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'html'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <Code className="h-4 w-4" />
          Para Humanos
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <Bot className="h-4 w-4" />
          Para Agentes de IA
        </button>
      </div>

      {/* HTML Integration */}
      {activeTab === 'html' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Endpoint da API</h3>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-2">
              <code className="flex-1 break-all">{baseUrl}/api/v1/submit</code>
              <button
                onClick={() => copyToClipboard(`${baseUrl}/api/v1/submit`, 'endpoint')}
                className="btn btn-sm btn-secondary"
              >
                {copied === 'endpoint' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Escolha o tipo de formulário</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveHtmlTab('form')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeHtmlTab === 'form'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                Form HTML simples
              </button>
              <button
                onClick={() => setActiveHtmlTab('js')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeHtmlTab === 'js'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                Com JavaScript (sem recarregar)
              </button>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{activeHtmlTab === 'form' ? snippets.html : snippets.htmlJs}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(activeHtmlTab === 'form' ? snippets.html : snippets.htmlJs, 'html')}
                className="absolute top-2 right-2 btn btn-sm btn-secondary"
              >
                {copied === 'html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === 'html' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">⚠️ Importante</h4>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Substitua <code>{baseUrl}</code> pelo domínio real do Milano Inbox</li>
              <li>• O campo <code>_token</code> identifica qual site está enviando</li>
              <li>• O campo <code>_honey</code> é honeypot anti-spam — não remova</li>
              <li>• Você pode adicionar outros campos personalizados</li>
            </ul>
          </div>
        </div>
      )}

      {/* AI Agent Integration */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Prompt para Agentes de IA
            </h3>
            <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
{`## TAREFA: INTEGRAR FORMULÁRIO DE CONTATO COM MILANO INBOX

### CONTEXTO
Você está implementando um formulário de contato para o site "${site.name}" (${site.domain}).
O cliente quer que todas as mensagens enviadas pelo formulário apareçam no painel Milano Inbox.

### ENDPOINT DA API
URL: ${baseUrl}/api/v1/submit
Método: POST
Autenticação: Header "X-Site-Token" com valor "${site.token}"

### CAMPOS DO FORMULÁRIO
O formulário pode ter os seguintes campos:
- name (string, obrigatório): Nome do visitante
- email (string, obrigatório): Email do visitante
- phone (string, opcional): Telefone do visitante
- subject (string, opcional): Assunto da mensagem
- message (string, obrigatório): Conteúdo da mensagem
- *campos_customizados (string, opcional): Qualquer campo extra será salvo

### EXEMPLO DE REQUISIÇÃO (JSON)
\`\`\`json
POST ${baseUrl}/api/v1/submit
Headers:
  Content-Type: application/json
  X-Site-Token: ${site.token}

Body:
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+55 11 99999-9999",
  "subject": "Quero um orçamento",
  "message": "Olá, gostaria de saber mais sobre..."
}
\`\`\`

### RESPOSTA DE SUCESSO
{
  "ok": true,
  "id": "msg_abc123",
  "received_at": "2024-06-17T12:00:00.000Z"
}

### REGRAS DE IMPLEMENTAÇÃO
1. O campo _honey (honeypot anti-spam) deve estar presente mas hidden
2. Valide o email com regex antes de enviar
3. Mostre mensagem de sucesso/erro para o usuário
4. Limpe o formulário após envio bem-sucedido
5. Trate erros de conexão gracefulmente
6. Não recarregue a página (use fetch/ajax)

### INSTRUÇÕES
1. Implemente o formulário de contato conforme o design do site
2. Adicione validação client-side (email válido, campos obrigatórios)
3. Implemente o envio via fetch() com tratamento de erros
4. Adicione feedback visual (loading, sucesso, erro)
5. O campo _honey deve existir no form mas estar hidden:
   <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
6. Se o campo _honey vier preenchido, não envie (é spam)

### AMBIENTE
- Backend existente: Next.js
- Frontend: HTML/CSS/JS ou React/Vue/etc
- O site destino é: ${site.domain}`}
            </pre>
            <button
              onClick={() => copyToClipboard(`## TAREFA: INTEGRAR FORMULÁRIO DE CONTATO COM MILANO INBOX

### CONTEXTO
Você está implementando um formulário de contato para o site "${site.name}" (${site.domain}).
O cliente quer que todas as mensagens enviadas pelo formulário apareçam no painel Milano Inbox.

### ENDPOINT DA API
URL: ${baseUrl}/api/v1/submit
Método: POST
Autenticação: Header "X-Site-Token" com valor "${site.token}"

### CAMPOS DO FORMULÁRIO
O formulário pode ter os seguintes campos:
- name (string, obrigatório): Nome do visitante
- email (string, obrigatório): Email do visitante
- phone (string, opcional): Telefone do visitante
- subject (string, opcional): Assunto da mensagem
- message (string, obrigatório): Conteúdo da mensagem
- *campos_customizados (string, opcional): Qualquer campo extra será salvo

### EXEMPLO DE REQUISIÇÃO (JSON)
\`\`\`json
POST ${baseUrl}/api/v1/submit
Headers:
  Content-Type: application/json
  X-Site-Token: ${site.token}

Body:
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+55 11 99999-9999",
  "subject": "Quero um orçamento",
  "message": "Olá, gostaria de saber mais sobre..."
}
\`\`\`

### RESPOSTA DE SUCESSO
{
  "ok": true,
  "id": "msg_abc123",
  "received_at": "2024-06-17T12:00:00.000Z"
}

### REGRAS DE IMPLEMENTAÇÃO
1. O campo _honey (honeypot anti-spam) deve estar presente mas hidden
2. Valide o email com regex antes de enviar
3. Mostre mensagem de sucesso/erro para o usuário
4. Limpe o formulário após envio bem-sucedido
5. Trate erros de conexão gracefulmente
6. Não recarregue a página (use fetch/ajax)

### INSTRUÇÕES
1. Implemente o formulário de contato conforme o design do site
2. Adicione validação client-side (email válido, campos obrigatórios)
3. Implemente o envio via fetch() com tratamento de erros
4. Adicione feedback visual (loading, sucesso, erro)
5. O campo _honey deve existir no form mas estar hidden:
   <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
6. Se o campo _honey vier preenchido, não envie (é spam)

### AMBIENTE
- Backend existente: Next.js
- Frontend: HTML/CSS/JS ou React/Vue/etc
- O site destino é: ${site.domain}`, 'ai-prompt')}
              className="btn btn-primary mt-4"
            >
              {copied === 'ai-prompt' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === 'ai-prompt' ? 'Copiado!' : 'Copiar Prompt Completo'}
            </button>
          </div>

          {/* Quick examples */}
          <div className="card">
            <h3 className="font-semibold mb-4">Exemplos Rápidos (código)</h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['curl', 'fetch', 'python', 'nodejs', 'php', 'go'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => copyToClipboard(snippets[lang], lang)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  {copied === lang ? <Check className="h-4 w-4 inline mr-1" /> : null}
                  {lang === 'nodejs' ? 'Node.js' : lang === 'php' ? 'PHP' : lang === 'curl' ? 'cURL' : lang}
                </button>
              ))}
            </div>
            <div className="relative">
              <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{snippets.fetch}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(snippets.fetch, 'fetch')}
                className="absolute top-2 right-2 btn btn-sm btn-secondary"
              >
                {copied === 'fetch' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
