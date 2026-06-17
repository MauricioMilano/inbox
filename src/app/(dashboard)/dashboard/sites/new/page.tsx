'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Copy, Check } from 'lucide-react'

export default function NewSitePage() {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdSite, setCreatedSite] = useState<{ token: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function copyToken(token: string) {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('domain', domain)
      formData.append('notificationEmail', notificationEmail)
      if (logo) formData.append('logo', logo)

      const res = await fetch('/api/sites', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar site')
      }

      const data = await res.json()
      setCreatedSite({ token: data.site.token, name: data.site.name })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar site')
    } finally {
      setLoading(false)
    }
  }

  // Success state - show token
  if (createdSite) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Site criado com sucesso!</h2>
            <p className="text-slate-600 mt-2">
              {createdSite.name} foi adicionado à sua conta
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Importante:</strong> Copie o token abaixo. Ele só será mostrado uma vez!
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Token do Site</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded text-sm break-all">
                {createdSite.token}
              </code>
              <button
                onClick={() => copyToken(createdSite.token)}
                className="btn btn-primary"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="font-medium mb-4">Próximos passos:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Cole o token no formulário de contato do site do cliente</li>
              <li>O formulário enviará as mensagens automaticamente</li>
              <li>As mensagens aparecerão aqui no Milano Inbox</li>
            </ol>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href="/dashboard" className="btn btn-secondary flex-1">
              Voltar ao Painel
            </Link>
            <Link href="/dashboard" className="btn btn-primary flex-1">
              Ver Meu Site
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="card">
        <h1 className="text-xl font-semibold mb-6">Adicionar Novo Site</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Site</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pizzaria do Tonho"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Domínio</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Ex: pizzariadotonho.com.br"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              O domínio do site do cliente (sem https://)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email de Notificação</label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="notificacoes@seuemail.com"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Receberá um email quando chegar uma nova mensagem
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Logo (opcional)</label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="btn btn-secondary cursor-pointer"
                >
                  Escolher imagem
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  PNG, JPG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard" className="btn btn-secondary flex-1">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Criando...' : 'Criar Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
