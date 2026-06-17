'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Eye, Check, Archive, Mail, MessageSquare } from 'lucide-react'
import { formatRelativeTime, truncate } from '@/lib/utils'

interface Message {
  id: string
  status: string
  senderName: string | null
  senderEmail: string | null
  subject: string | null
  content: string | null
  createdAt: string
}

export default function SiteMessagesPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [siteName, setSiteName] = useState('')
  const [filter, setFilter] = useState('todas')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadSite()
    loadMessages()
  }, [siteId, filter, search])

  async function loadSite() {
    try {
      const res = await fetch(`/api/sites/${siteId}`)
      if (res.ok) {
        const data = await res.json()
        setSiteName(data.site.name)
      }
    } catch (error) {
      console.error('Failed to load site:', error)
    }
  }

  async function loadMessages() {
    try {
      const urlParams = new URLSearchParams({ siteId })
      if (filter !== 'todas') urlParams.set('status', filter)
      if (search) urlParams.set('search', search)

      const res = await fetch(`/api/messages?${urlParams}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(messageId: string, status: string) {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setMessages(messages.map((m) =>
          m.id === messageId ? { ...m, status } : m
        ))
      }
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  const statusLabels: Record<string, string> = {
    todas: 'Todas',
    nova: 'Não lidas',
    lida: 'Lidas',
    respondida: 'Respondidas',
    arquivada: 'Arquivadas',
  }

  const statusIcons: Record<string, React.ReactNode> = {
    nova: <span className="w-2 h-2 bg-blue-500 rounded-full"></span>,
    lida: <span className="w-2 h-2 bg-slate-400 rounded-full"></span>,
    respondida: <span className="w-2 h-2 bg-green-500 rounded-full"></span>,
    arquivada: <span className="w-2 h-2 bg-slate-300 rounded-full"></span>,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="btn btn-ghost p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{siteName || 'Carregando...'}</h1>
          <p className="text-sm text-slate-500">Caixa de entrada</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  filter === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar mensagens..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Nenhuma mensagem
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {search
              ? 'Nenhuma mensagem corresponde à busca'
              : 'As mensagens do formulário aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`card hover:shadow-md transition-shadow ${
                message.status === 'nova' ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <Link href={`/dashboard/sites/${siteId}/messages/${message.id}`} className="block">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className="pt-1">{statusIcons[message.status]}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`font-medium truncate ${message.status === 'nova' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {message.senderName || 'Sem nome'}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {message.subject && <span className="font-medium">{message.subject} — </span>}
                      {message.content ? truncate(message.content, 80) : 'Sem conteúdo'}
                    </p>
                    {message.senderEmail && (
                      <p className="text-xs text-slate-400 mt-1">{message.senderEmail}</p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Quick actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                {message.status === 'nova' && (
                  <button
                    onClick={() => updateStatus(message.id, 'lida')}
                    className="btn btn-ghost text-xs"
                  >
                    <Eye className="h-3 w-3" />
                    Marcar como lida
                  </button>
                )}
                {message.status !== 'respondida' && (
                  <button
                    onClick={() => updateStatus(message.id, 'respondida')}
                    className="btn btn-ghost text-xs"
                  >
                    <Check className="h-3 w-3" />
                    Responder
                  </button>
                )}
                {message.status !== 'arquivada' && (
                  <button
                    onClick={() => updateStatus(message.id, 'arquivada')}
                    className="btn btn-ghost text-xs"
                  >
                    <Archive className="h-3 w-3" />
                    Arquivar
                  </button>
                )}
                <a
                  href={`mailto:${message.senderEmail}`}
                  className="btn btn-ghost text-xs ml-auto"
                >
                  <Mail className="h-3 w-3" />
                  Responder por email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
