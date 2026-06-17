'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Mail, TestTube, Check, AlertCircle, Loader2 } from 'lucide-react'

interface UserSettings {
  id: string
  email: string
  name: string | null
  smtpEnabled: boolean
  smtpHost: string | null
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string | null
  smtpPass: string | null
  smtpFromEmail: string | null
  smtpFromName: string | null
  hasSmtpPass: boolean
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [smtpEnabled, setSmtpEnabled] = useState(false)
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpSecure, setSmtpSecure] = useState(true)
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpFromEmail, setSmtpFromEmail] = useState('')
  const [smtpFromName, setSmtpFromName] = useState('')
  const [hasSmtpPass, setHasSmtpPass] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const user = data.user as UserSettings
        setName(user.name || '')
        setSmtpEnabled(user.smtpEnabled)
        setSmtpHost(user.smtpHost || '')
        setSmtpPort(String(user.smtpPort || 587))
        setSmtpSecure(user.smtpSecure !== false)
        setSmtpUser(user.smtpUser || '')
        setSmtpPass('')
        setHasSmtpPass(user.hasSmtpPass)
        setSmtpFromEmail(user.smtpFromEmail || '')
        setSmtpFromName(user.smtpFromName || '')
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(testConnection = false) {
    setSaving(true)
    setTesting(testConnection)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          smtpEnabled,
          smtpHost: smtpHost || null,
          smtpPort: parseInt(smtpPort) || 587,
          smtpSecure,
          smtpUser: smtpUser || null,
          smtpPass: smtpPass || undefined,
          smtpFromEmail: smtpFromEmail || null,
          smtpFromName: smtpFromName || null,
          testConnection,
        }),
      })

      const data = await res.json()

      if (testConnection) {
        if (data.success) {
          setMessage({ type: 'success', text: '✅ Conexão SMTP testada com sucesso!' })
        } else {
          setMessage({ type: 'error', text: `❌ Erro na conexão: ${data.error}` })
        }
      } else if (data.ok) {
        setMessage({ type: 'success', text: '✅ Configurações salvas com sucesso!' })
        if (smtpPass) setHasSmtpPass(true)
        setSmtpPass('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="btn btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Configurações</h1>
          <p className="text-sm text-slate-500">Gerencie sua conta e notificações</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`card mb-6 flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={smtpFromEmail}
              onChange={(e) => setSmtpFromEmail(e.target.value)}
              placeholder="seu@email.com"
            />
            <p className="text-xs text-slate-500 mt-1">
              Este email é usado para login e para enviar notificações
            </p>
          </div>
        </div>
      </div>

      {/* SMTP Settings */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificações por Email
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure o SMTP para receber emails quando chegar mensagens
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={smtpEnabled}
              onChange={(e) => setSmtpEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Ativado</span>
          </label>
        </div>

        {smtpEnabled && (
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
              <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">💡 Dica</p>
              <p className="text-amber-700 dark:text-amber-300">
                Para Gmail, use sua <strong>Senha de app</strong> (não sua senha normal).
                Gere em: myaccount.google.com → Segurança → Senhas de app
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Servidor SMTP</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Porta</label>
                <select
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full"
                >
                  <option value="587">587 (STARTTLS)</option>
                  <option value="465">465 (SSL/TLS)</option>
                  <option value="25">25 (Sem TLS)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Segurança</label>
                <select
                  value={smtpSecure ? 'true' : 'false'}
                  onChange={(e) => setSmtpSecure(e.target.value === 'true')}
                  className="w-full"
                >
                  <option value="true">TLS (recomendado)</option>
                  <option value="false">STARTTLS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usuário</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Senha
                  {hasSmtpPass && <span className="text-slate-400 font-normal ml-1">(deixei vazio pra manter)</span>}
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder={hasSmtpPass ? '••••••••' : 'Sua senha ou senha de app'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email de envio</label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  placeholder="noreply@seusite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nome de envio</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="Milano Inbox"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="btn btn-primary flex-1"
        >
          {saving && !testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar
        </button>

        {smtpEnabled && (
          <button
            onClick={() => handleSave(true)}
            disabled={saving || testing || !smtpHost || !smtpUser}
            className="btn btn-secondary flex items-center gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Testar Conexão
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          As notificações são enviadas para o email cadastrado em cada site.
          <br />
          Configure o SMTP acima para ativar.
        </p>
      </div>
    </div>
  )
}
