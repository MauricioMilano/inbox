'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Globe, Mail, ExternalLink, Copy, Check, MoreVertical, Trash2, Edit2, Code } from 'lucide-react'

interface Site {
  id: string
  name: string
  domain: string
  notificationEmail: string
  logoPath: string | null
  token: string
  newCount: number
  totalCount: number
}

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [showToken, setShowToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadSites()
  }, [])

  async function loadSites() {
    try {
      const res = await fetch('/api/sites')
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites)
      }
    } catch (error) {
      console.error('Failed to load sites:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyToken(token: string) {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openEditModal(site: Site) {
    setEditingSite(site)
    setShowModal(true)
  }

  async function handleDelete(siteId: string) {
    if (!confirm('Tem certeza que deseja excluir este site? Todas as mensagens serão perdidas.')) {
      return
    }

    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: 'DELETE' })
      if (res.ok) {
        setSites(sites.filter((s) => s.id !== siteId))
      }
    } catch (error) {
      console.error('Failed to delete site:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Sites</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie seus sites e veja as mensagens recebidas
          </p>
        </div>
        <Link href="/dashboard/sites/new" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Novo Site
        </Link>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Nenhum site cadastrado
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Adicione seu primeiro site para começar a receber mensagens
          </p>
          <Link href="/dashboard/sites/new" className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Adicionar Site
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.id} className="card hover:shadow-lg transition-shadow">
              {/* Logo / Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {site.logoPath ? (
                    <img
                      src={site.logoPath}
                      alt={site.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Globe className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(site)}
                    className="btn btn-ghost p-2"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="btn btn-ghost p-2 text-red-500 hover:text-red-600"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                {site.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {site.domain}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                {site.newCount > 0 && (
                  <span className="badge badge-primary">
                    {site.newCount} nova{site.newCount !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400">
                  {site.totalCount} total
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/sites/${site.id}/messages`}
                  className="btn btn-primary flex-1"
                >
                  <Mail className="h-4 w-4" />
                  Ver Mensagens
                </Link>
                <Link
                  href={`/dashboard/sites/${site.id}/integration`}
                  className="btn btn-secondary"
                  title="Ver integração"
                >
                  <Code className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setShowToken(showToken === site.id ? null : site.id)}
                  className="btn btn-secondary"
                  title="Ver token"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Token display */}
              {showToken === site.id && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Token do Site</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded flex-1 break-all">
                      {site.token}
                    </code>
                    <button
                      onClick={() => copyToken(site.token)}
                      className="btn btn-ghost p-1"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingSite && (
        <SiteEditModal
          site={editingSite}
          onClose={() => {
            setShowModal(false)
            setEditingSite(null)
          }}
          onSave={() => {
            setShowModal(false)
            setEditingSite(null)
            loadSites()
          }}
        />
      )}
    </div>
  )
}

function SiteEditModal({
  site,
  onClose,
  onSave,
}: {
  site: Site
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(site.name)
  const [domain, setDomain] = useState(site.domain)
  const [notificationEmail, setNotificationEmail] = useState(site.notificationEmail)
  const [logo, setLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao atualizar site')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar site')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Editar Site</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domínio</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="cliente.com.br"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email de Notificação</label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
